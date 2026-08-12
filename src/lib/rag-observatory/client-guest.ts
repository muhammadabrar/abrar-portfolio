"use client";

const STORAGE_KEY = "rag_observatory_guest_v1";
const BYOK_KEY = "rag_observatory_mistral_key";

export type LocalGuest = {
  guestId: string;
  createdAt: string;
};

function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getOrCreateLocalGuest(): LocalGuest {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LocalGuest;
      if (parsed.guestId) return parsed;
    }
  } catch {
    // ignore
  }
  const guest: LocalGuest = {
    guestId: uuid(),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guest));
  return guest;
}

export function clearLocalGuest() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getByokKey(): string {
  try {
    return localStorage.getItem(BYOK_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setByokKey(key: string) {
  if (!key.trim()) localStorage.removeItem(BYOK_KEY);
  else localStorage.setItem(BYOK_KEY, key.trim());
}

export async function ragFetch(path: string, init: RequestInit = {}) {
  const guest = getOrCreateLocalGuest();
  const headers = new Headers(init.headers);
  headers.set("X-Guest-Id", guest.guestId);
  const byok = getByokKey();
  if (byok) headers.set("X-Mistral-Key", byok);
  return fetch(path, { ...init, headers });
}
