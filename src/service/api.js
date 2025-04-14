import { dbPromise } from "../lib/db.js";

const SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"];
const API_BASE = "https://www.googleapis.com/youtube/v3";
const CREDENTIAL_KEY = "credentials.json";
const TOKEN_KEY = "token.json";
const AUTH_ROUTE = "5173/oauth"; // sesuaikan dengan port yang digunakan oleh Vite + route untuk oauth page

const getSpamKeywords = async () => {
  const db = await dbPromise;
  const tx = db.transaction("keywords", "readonly");
  const store = tx.objectStore("keywords");
  const spamKeywords = await store.getAll();

  return spamKeywords;
};

const getSpamComment = (text, spamKeywords) => {
  const normalizedText = text.normalize("NFKD");

  if (text !== normalizedText) {
    return true;
  }

  text = text.toLowerCase();

  return spamKeywords.some(({ word }) => text.includes(word.toLowerCase()));
};

export const authorize = () => {
  const credentialRaw = localStorage.getItem(CREDENTIAL_KEY);

  if (!credentialRaw) {
    alert(
      "File credentials.json tidak ditemukan. Silakan upload terlebih dahulu."
    );
    return;
  }

  const credentials = JSON.parse(credentialRaw);
  const { client_id, redirect_uris } = credentials.installed || {};

  if (!client_id || !redirect_uris || redirect_uris.length === 0) {
    alert("Data credentials.json tidak lengkap.");
    return;
  }

  const redirect_uri = redirect_uris[0] + ":" + AUTH_ROUTE;
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  authUrl.searchParams.set("client_id", client_id);
  authUrl.searchParams.set("redirect_uri", redirect_uri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPES.join(" "));
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  // Buka halaman Google OAuth di tab baru
  window.open(authUrl.toString(), "_blank");
};

export const generateNewToken = async (code) => {
  const credentialRaw = localStorage.getItem(CREDENTIAL_KEY);
  if (!credentialRaw) throw new Error("Credentials tidak ditemukan");

  const credentials = JSON.parse(credentialRaw);
  const { client_id, client_secret, redirect_uris } =
    credentials.installed || {};
  const redirect_uri = redirect_uris[0] + ":" + AUTH_ROUTE;

  const params = new URLSearchParams({
    code,
    client_id,
    client_secret,
    redirect_uri,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error_description || "Gagal mengambil token");
  }

  const tokenData = await response.json();

  // Tambahkan timestamp saat token dibuat
  const tokenWithTimestamp = {
    ...tokenData,
    created_at: Math.floor(Date.now() / 1000), // detik
  };

  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenWithTimestamp));

  return tokenWithTimestamp;
};

export const refreshAccessToken = async () => {
  const credentialRaw = localStorage.getItem(CREDENTIAL_KEY);
  const tokenRaw = localStorage.getItem(TOKEN_KEY);

  if (!credentialRaw || !tokenRaw) {
    throw new Error("Credential atau Token belum tersedia");
  }

  const credentials = JSON.parse(credentialRaw);
  const tokenData = JSON.parse(tokenRaw);

  const { client_id, client_secret } = credentials.installed || {};
  const { refresh_token } = tokenData;

  if (!refresh_token) {
    throw new Error("Refresh token tidak ditemukan di token data.");
  }

  const params = new URLSearchParams({
    client_id,
    client_secret,
    refresh_token,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error_description || "Gagal me-refresh token");
  }

  const newToken = await response.json();

  // Gabungkan token lama & baru untuk menyimpan refresh_token dan created_at
  const updatedToken = {
    ...tokenData,
    ...newToken,
    refresh_token: refresh_token, // pastikan tidak hilang
    created_at: Math.floor(Date.now() / 1000),
  };

  localStorage.setItem(TOKEN_KEY, JSON.stringify(updatedToken));

  return updatedToken;
};

export const isAccessTokenExpired = () => {
  const tokenRaw = localStorage.getItem(TOKEN_KEY);
  if (!tokenRaw) return true;

  const tokenData = JSON.parse(tokenRaw);
  const { created_at, expires_in } = tokenData;

  if (!created_at || !expires_in) return true;

  const currentTime = Math.floor(Date.now() / 1000); // dalam detik
  const expired = currentTime >= created_at + expires_in - 60; // -60 buat buffer 1 menit

  return expired;
};

export const getAuthUrl = () => {
  const credentialRaw = localStorage.getItem(CREDENTIAL_KEY);
  if (!credentialRaw) return "#";
  const credentials = JSON.parse(credentialRaw);

  const { client_id, redirect_uris } = credentials.installed || {};
  const redirect_uri = redirect_uris[0] + ":" + AUTH_ROUTE;

  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const getAccessToken = () => {
  const tokenData = localStorage.getItem(TOKEN_KEY);

  if (!tokenData) {
    alert("Token belum tersedia. Silahkan generate token terlebih dahulu.");
    throw new Error("Token tidak ditemukan");
  }

  return JSON.parse(tokenData).access_token;
};

export const fetchCommentsFromVideoById = async (videoId) => {
  const accessToken = getAccessToken();
  const spamKeywords = await getSpamKeywords();
  const spamComments = [];
  let nextPageToken = "";

  do {
    const url = new URL(`${API_BASE}/commentThreads`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("videoId", videoId);
    url.searchParams.set("maxResults", "100");
    if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        alert("Token telah kadaluarsa. Mohon generate token lagi.");
        throw new Error("Token telah kadaluarsa");
      };
      
      alert("Gagal mengambil komentar.");
      console.error("Gagal mengambil komentar:", await response.json());
      break;
    }

    const data = await response.json();
    nextPageToken = data.nextPageToken;

    data.items.forEach((item) => {
      const comment = item.snippet.topLevelComment.snippet;
      const commentText = comment.textDisplay;
      const commentId = item.id;

      if (getSpamComment(commentText, spamKeywords)) {
        spamComments.push({
          commentId: commentId,
          text: commentText,
        });
      }
    });
  } while (nextPageToken);

  return spamComments;
};

export const fetchCommentsFromChannelById = async (channelId) => {
  const accessToken = getAccessToken();
  const spamKeywords = await getSpamKeywords();
  const spamComments = [];
  let nextPageToken = "";

  const videoUrl = new URL(`${API_BASE}/search`);
  videoUrl.searchParams.set("part", "snippet");
  videoUrl.searchParams.set("channelId", channelId);
  videoUrl.searchParams.set("maxResults", "50"); // ambil 50 video per response
  if (nextPageToken) videoUrl.searchParams.set("pageToken", nextPageToken);

  try {
    let videoResponse = await fetch(videoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!videoResponse.ok) {
      if (videoResponse.status === 401) {
        alert("Token telah kadaluarsa. Mohon generate token lagi.");
        throw new Error("Token telah kadaluarsa");
      };

      console.error(
        "Gagal mengambil video dari channel:",
        await videoResponse.json()
      );
      return [];
    }

    const videoData = await videoResponse.json();
    nextPageToken = videoData.nextPageToken;

    for (const videoItem of videoData.items) {
      const videoId = videoItem.id.videoId;

      if (videoId) {
        let commentPageToken = "";

        do {
          const commentsUrl = new URL(`${API_BASE}/commentThreads`);
          commentsUrl.searchParams.set("part", "snippet");
          commentsUrl.searchParams.set("videoId", videoId);
          commentsUrl.searchParams.set("maxResults", "100"); // Aambil 100 komentar per video
          if (commentPageToken)
            commentsUrl.searchParams.set("pageToken", commentPageToken);

          let commentResponse = await fetch(commentsUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!commentResponse.ok) {
            console.error(
              `Gagal mengambil komentar untuk video ${videoId}:`,
              await commentResponse.json()
            );
            continue;
          }

          const commentData = await commentResponse.json();
          commentPageToken = commentData.nextPageToken;

          // Proses komentar untuk setiap video
          commentData.items.forEach((item) => {
            const comment = item.snippet.topLevelComment.snippet;
            const commentText = comment.textDisplay;
            const commentId = item.id;

            if (getSpamComment(commentText, spamKeywords)) {
              spamComments.push({
                videoId,
                commentId,
                text: commentText,
              });
            }
          });
        } while (commentPageToken); // Lanjutkan jika ada halaman berikutnya untuk komentar
      }
    }
  } catch (error) {
    console.error("Error fetching videos and comments:", error);
    return [];
  }

  return spamComments;
};

export const getDetailVideoById = async (videoId) => {
  const accessToken = getAccessToken();
  const url = `${API_BASE}/videos?part=snippet&id=${videoId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Gagal mengambil video:", await response.json());
    return [];
  }

  const data = await response.json();

  return data.items[0].snippet;
};

export const getDetailChannelById = async (channelId) => {
  const accessToken = getAccessToken();
  const url = `${API_BASE}/channels?part=snippet&id=${channelId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Gagal mengambil detail channel:", await response.json());
    return null;
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    console.warn("Channel tidak ditemukan.");
    return null;
  }

  return data.items[0].snippet;
};

/**
 * * Moderasi komentar yang spam diubah menjadi rejected
 * * Cara ini digunakan untuk mengehemat limit ke API Google
 * * Hasilnya komentar spam tidak ditampilkan di videonya
 */
export const rejectComments = async (commentIds, logger = () => {}) => {
  const accessToken = getAccessToken();
  const totalCommentsToBeDeleted = commentIds.length;
  let totalDeletedComments = 0;

  while (commentIds.length > 0) {
    const commentIdsChunk = commentIds.splice(0, 50);

    const url = new URL(`${API_BASE}/comments/setModerationStatus`);
    url.searchParams.set("id", commentIdsChunk.join(","));
    url.searchParams.set("moderationStatus", "rejected");

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const err = await response.json();
        logger(
          `❌ Gagal menghapus ${
            commentIdsChunk.length
          } komentar: ${JSON.stringify(err)}`
        );
        continue;
      }

      totalDeletedComments += commentIdsChunk.length;
      logger(
        `✅ Berhasil menghapus ${commentIdsChunk.length} komentar. Total: ${totalDeletedComments}/${totalCommentsToBeDeleted}`
      );
    } catch (error) {
      logger(`❌ Error saat menghapus: ${error.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }
};
