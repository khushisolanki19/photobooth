import { createEmptySlots } from "../layouts";
import { themeToConfig, getTheme } from "../themes/catalog";
import type { Participant, Photo, Room, StripSlot, StripThemeConfig } from "../types";
import { colorForIndex, generateRoomCode, uid } from "../utils";
import { getSupabase, isSupabaseConfigured } from "./supabase";

const LOCAL_KEY = "photobooth-rooms-v1";
const ROOM_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

type LocalDB = {
  rooms: Record<string, Room>;
  participants: Record<string, Participant[]>;
  photos: Record<string, Photo[]>;
};

function readLocal(): LocalDB {
  if (typeof window === "undefined") {
    return { rooms: {}, participants: {}, photos: {} };
  }
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return { rooms: {}, participants: {}, photos: {} };
    return JSON.parse(raw) as LocalDB;
  } catch {
    return { rooms: {}, participants: {}, photos: {} };
  }
}

function writeLocal(db: LocalDB) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent("photobooth-room-sync"));
  try {
    const bc = new BroadcastChannel("photobooth-rooms");
    bc.postMessage({ type: "sync" });
    bc.close();
  } catch {
    /* BroadcastChannel unsupported */
  }
}

export function backendMode(): "supabase" | "local" {
  return isSupabaseConfigured() ? "supabase" : "local";
}

export async function createRoom(input: {
  hostName: string;
  layoutId: string;
}): Promise<{ room: Room; participant: Participant }> {
  const hostId = uid("guest");
  const code = generateRoomCode();
  const now = Date.now();
  const theme = themeToConfig(getTheme("classic-white"));
  const room: Room = {
    id: uid("room"),
    code,
    hostId,
    layoutId: input.layoutId,
    createdAt: now,
    expiresAt: now + ROOM_TTL_MS,
    status: "active",
    stripSlots: createEmptySlots(input.layoutId),
    theme,
  };
  const participant: Participant = {
    id: hostId,
    roomId: room.id,
    name: input.hostName.trim() || "Host",
    isHost: true,
    connected: true,
    joinedAt: now,
    color: colorForIndex(0),
  };

  if (backendMode() === "supabase") {
    const sb = getSupabase()!;
    const { error } = await sb.from("rooms").insert({
      id: room.id,
      code: room.code,
      host_id: room.hostId,
      layout_id: room.layoutId,
      created_at: new Date(room.createdAt).toISOString(),
      expires_at: new Date(room.expiresAt).toISOString(),
      status: room.status,
      strip_slots: room.stripSlots,
      theme: room.theme,
    });
    if (error) throw new Error(error.message);
    const { error: pErr } = await sb.from("participants").insert({
      id: participant.id,
      room_id: participant.roomId,
      name: participant.name,
      is_host: true,
      connected: true,
      joined_at: new Date(participant.joinedAt).toISOString(),
      color: participant.color,
    });
    if (pErr) throw new Error(pErr.message);
    return { room, participant };
  }

  const db = readLocal();
  db.rooms[room.code] = room;
  db.participants[room.id] = [participant];
  db.photos[room.id] = [];
  writeLocal(db);
  return { room, participant };
}

export async function joinRoom(input: {
  code: string;
  name: string;
}): Promise<{ room: Room; participant: Participant }> {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim() || "Guest";

  if (backendMode() === "supabase") {
    const sb = getSupabase()!;
    const { data: row, error } = await sb
      .from("rooms")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("ROOM_NOT_FOUND");
    const room = mapRoom(row);
    assertRoomActive(room);
    const { count } = await sb
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("room_id", room.id);
    const participant: Participant = {
      id: uid("guest"),
      roomId: room.id,
      name,
      isHost: false,
      connected: true,
      joinedAt: Date.now(),
      color: colorForIndex(count ?? 1),
    };
    const { error: pErr } = await sb.from("participants").insert({
      id: participant.id,
      room_id: participant.roomId,
      name: participant.name,
      is_host: false,
      connected: true,
      joined_at: new Date(participant.joinedAt).toISOString(),
      color: participant.color,
    });
    if (pErr) throw new Error(pErr.message);
    return { room, participant };
  }

  const db = readLocal();
  const room = db.rooms[code];
  if (!room) throw new Error("ROOM_NOT_FOUND");
  assertRoomActive(room);
  const list = db.participants[room.id] ?? [];
  const participant: Participant = {
    id: uid("guest"),
    roomId: room.id,
    name,
    isHost: false,
    connected: true,
    joinedAt: Date.now(),
    color: colorForIndex(list.length),
  };
  list.push(participant);
  db.participants[room.id] = list;
  writeLocal(db);
  return { room, participant };
}

export async function getRoomByCode(code: string): Promise<Room | null> {
  const normalized = code.trim().toUpperCase();
  if (backendMode() === "supabase") {
    const sb = getSupabase()!;
    const { data, error } = await sb
      .from("rooms")
      .select("*")
      .eq("code", normalized)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapRoom(data) : null;
  }
  return readLocal().rooms[normalized] ?? null;
}

export async function listParticipants(roomId: string): Promise<Participant[]> {
  if (backendMode() === "supabase") {
    const sb = getSupabase()!;
    const { data, error } = await sb
      .from("participants")
      .select("*")
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapParticipant);
  }
  return readLocal().participants[roomId] ?? [];
}

export async function listPhotos(roomId: string): Promise<Photo[]> {
  if (backendMode() === "supabase") {
    const sb = getSupabase()!;
    const { data, error } = await sb
      .from("photos")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapPhoto);
  }
  return readLocal().photos[roomId] ?? [];
}

export async function uploadRoomPhoto(input: {
  room: Room;
  participant: Participant;
  dataUrl: string;
}): Promise<Photo> {
  const photo: Photo = {
    id: uid("photo"),
    roomId: input.room.id,
    participantId: input.participant.id,
    participantName: input.participant.name,
    src: input.dataUrl,
    timestamp: Date.now(),
    selected: true,
  };

  if (backendMode() === "supabase") {
    const sb = getSupabase()!;
    const path = `${input.room.id}/${photo.id}.jpg`;
    const blob = await (await fetch(input.dataUrl)).blob();
    const { error: upErr } = await sb.storage
      .from("room-photos")
      .upload(path, blob, { contentType: "image/jpeg", upsert: true });
    if (upErr) throw new Error(upErr.message);
    const { data: pub } = sb.storage.from("room-photos").getPublicUrl(path);
    photo.src = pub.publicUrl;
    const { error } = await sb.from("photos").insert({
      id: photo.id,
      room_id: input.room.id,
      participant_id: input.participant.id,
      storage_path: path,
      public_url: photo.src,
      created_at: new Date(photo.timestamp).toISOString(),
    });
    if (error) throw new Error(error.message);
    return photo;
  }

  const db = readLocal();
  const list = db.photos[input.room.id] ?? [];
  list.push(photo);
  db.photos[input.room.id] = list;
  writeLocal(db);
  return photo;
}

export async function updateRoomStrip(input: {
  room: Room;
  slots: StripSlot[];
  theme?: StripThemeConfig;
  layoutId?: string;
}): Promise<Room> {
  const next: Room = {
    ...input.room,
    stripSlots: input.slots,
    theme: input.theme ?? input.room.theme,
    layoutId: input.layoutId ?? input.room.layoutId,
  };

  if (backendMode() === "supabase") {
    const sb = getSupabase()!;
    const { error } = await sb
      .from("rooms")
      .update({
        strip_slots: next.stripSlots,
        theme: next.theme,
        layout_id: next.layoutId,
      })
      .eq("id", next.id);
    if (error) throw new Error(error.message);
    return next;
  }

  const db = readLocal();
  db.rooms[next.code] = next;
  writeLocal(db);
  return next;
}

export async function deleteRoom(room: Room): Promise<void> {
  if (backendMode() === "supabase") {
    const sb = getSupabase()!;
    await sb.storage.from("room-photos").remove(
      ((await listPhotos(room.id)) || []).map((p) => `${room.id}/${p.id}.jpg`),
    );
    await sb.from("photos").delete().eq("room_id", room.id);
    await sb.from("participants").delete().eq("room_id", room.id);
    await sb.from("rooms").update({ status: "ended" }).eq("id", room.id);
    await sb.from("rooms").delete().eq("id", room.id);
    return;
  }
  const db = readLocal();
  delete db.rooms[room.code];
  delete db.participants[room.id];
  delete db.photos[room.id];
  writeLocal(db);
}

export async function setParticipantConnected(
  participantId: string,
  connected: boolean,
): Promise<void> {
  if (backendMode() === "supabase") {
    const sb = getSupabase()!;
    await sb.from("participants").update({ connected }).eq("id", participantId);
    return;
  }
  const db = readLocal();
  for (const roomId of Object.keys(db.participants)) {
    db.participants[roomId] = db.participants[roomId].map((p) =>
      p.id === participantId ? { ...p, connected } : p,
    );
  }
  writeLocal(db);
}

export function subscribeRoom(
  roomId: string,
  onChange: () => void,
): () => void {
  if (backendMode() === "supabase") {
    const sb = getSupabase()!;
    const channel = sb
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants", filter: `room_id=eq.${roomId}` },
        () => onChange(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "photos", filter: `room_id=eq.${roomId}` },
        () => onChange(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` },
        () => onChange(),
      )
      .subscribe();
    return () => {
      void sb.removeChannel(channel);
    };
  }

  const handler = () => onChange();
  window.addEventListener("photobooth-room-sync", handler);
  window.addEventListener("storage", handler);
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel("photobooth-rooms");
    bc.onmessage = handler;
  } catch {
    /* ignore */
  }
  const poll = window.setInterval(handler, 2000);
  return () => {
    window.removeEventListener("photobooth-room-sync", handler);
    window.removeEventListener("storage", handler);
    bc?.close();
    window.clearInterval(poll);
  };
}

function assertRoomActive(room: Room) {
  if (room.status === "ended" || room.expiresAt < Date.now()) {
    throw new Error("ROOM_EXPIRED");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRoom(row: any): Room {
  return {
    id: row.id,
    code: row.code,
    hostId: row.host_id,
    layoutId: row.layout_id,
    createdAt: new Date(row.created_at).getTime(),
    expiresAt: new Date(row.expires_at).getTime(),
    status: row.status,
    stripSlots: row.strip_slots,
    theme: row.theme,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapParticipant(row: any): Participant {
  return {
    id: row.id,
    roomId: row.room_id,
    name: row.name,
    isHost: row.is_host,
    connected: row.connected,
    joinedAt: new Date(row.joined_at).getTime(),
    color: row.color,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPhoto(row: any): Photo {
  return {
    id: row.id,
    roomId: row.room_id,
    participantId: row.participant_id,
    src: row.public_url,
    timestamp: new Date(row.created_at).getTime(),
    selected: true,
  };
}
