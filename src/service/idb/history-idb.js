import { dbPromise } from "./main-idb.js";

/**
 * Mendapatkan semua history yang ada di object history
 */
export const getHistory = async () => {
  const db = await dbPromise;
  const tx = db.transaction("history", "readonly");
  const store = tx.objectStore("history");
  const temp = await store.getAll();
  const allHistory = temp.sort((a, b) => b.id - a.id); // sorting descending

  return allHistory;
};

/**
 * Menambah satu history baru
 */
export const addHistory = async ({ title, id, totalSpam, thumbnail, isChannel }) => {
  const db = await dbPromise;
  const tx = db.transaction("history", "readwrite");
  const store = tx.objectStore("history");

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Januari = 0
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const createdAt = `${year}-${month}-${day} ${hours}:${minutes}`;
  const url = isChannel
    ? `https://www.youtube.com/channel/${id}`
    : `https://www.youtube.com/watch?v=${id}`;

  await store.add({ title, url, totalSpam, thumbnail, createdAt });
};
