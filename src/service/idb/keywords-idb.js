import { dbPromise } from "./main-idb.js";

/**
 * Get semua spam keywords yang ada di object keywords
 */
export const getKeywords = async () => {
  const db = await dbPromise;
  const tx = db.transaction("keywords", "readonly");
  const store = tx.objectStore("keywords");
  const temp = await store.getAll();
  const spamKeywords = temp.sort((a, b) => b.id - a.id); // sorting descending

  return spamKeywords;
};

/**
 * Tambah satu keyword spam
 */
export const addKeyword = async (newKeyword) => {
  if (!newKeyword.trim()) return;
  const db = await dbPromise;
  const tx = db.transaction("keywords", "readwrite");
  const store = tx.objectStore("keywords");
  await store.add({ word: newKeyword });
};

/**
 * Hapus satu keyword spam
 */
export const deleteKeywordById = async (id) => {
  const db = await dbPromise;
  const tx = db.transaction("keywords", "readwrite");
  const store = tx.objectStore("keywords");
  await store.delete(id);
};