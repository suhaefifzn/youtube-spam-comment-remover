import { getAccessToken } from "./auth-api.js";
import { getSpamComment } from "../../utils.js";
import { getKeywords } from "../idb/keywords-idb.js";

/**
 * Lebih lengkapnya, silahkan lihat dokumentasi
 * YouTube Data API v3 di https://developers.google.com/youtube/v3/docs
 */

const API_BASE = "https://www.googleapis.com/youtube/v3";

/**
 * Get semua komentar dari video
 */
export const fetchCommentsFromVideoById = async (videoId) => {
  const spamComments = [];
  let nextPageToken = "";

  try {
    const accessToken = getAccessToken();
    const spamKeywords = await getKeywords();

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
        }
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
  } catch (error) {
    console.error("Error fetching comments:", error);
  }

  return spamComments;
};

/**
 * Get semua komentar dari semua video yang ada di channel
 */
export const fetchCommentsFromChannelById = async (channelId) => {
  const spamComments = [];
  let nextPageToken = "";

  try {
    const accessToken = getAccessToken();
    const spamKeywords = await getKeywords();

    const videoUrl = new URL(`${API_BASE}/search`);
    videoUrl.searchParams.set("part", "snippet");
    videoUrl.searchParams.set("channelId", channelId);
    videoUrl.searchParams.set("maxResults", "50"); // ambil 50 video per response
    if (nextPageToken) videoUrl.searchParams.set("pageToken", nextPageToken);

    let videoResponse = await fetch(videoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!videoResponse.ok) {
      if (videoResponse.status === 401) {
        alert("Token telah kadaluarsa. Mohon generate token lagi.");
        throw new Error("Token telah kadaluarsa");
      }

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
          commentsUrl.searchParams.set("maxResults", "100"); // Ambil 100 komentar per video
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
  }

  return spamComments;
};

/**
 * Get detail satu video
 */
export const getDetailVideoById = async (videoId) => {
  const url = `${API_BASE}/videos?part=snippet&id=${videoId}`;

  try {
    const accessToken = getAccessToken();

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
  } catch (error) {
    console.error("Error fetching video details:", error);
    return [];
  }
};

/**
 * Get detail channel pengguna
 */
export const getDetailChannelById = async (channelId) => {
  const url = `${API_BASE}/channels?part=snippet&id=${channelId}`;

  try {
    const accessToken = getAccessToken();

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
  } catch (error) {
    console.error("Error fetching channel details:", error);
    return null;
  }
};

/**
 * Sembunyikan komentar spam dari video
 * dengan mengubah status moderasi menjadi rejected
 */
export const rejectComments = async (commentIds, logger = () => {}) => {
  const totalCommentsToBeDeleted = commentIds.length;
  let totalDeletedComments = 0;

  try {
    const accessToken = getAccessToken();

    while (commentIds.length > 0) {
      const commentIdsChunk = commentIds.splice(0, 50);

      const url = new URL(`${API_BASE}/comments/setModerationStatus`);
      url.searchParams.set("id", commentIdsChunk.join(","));
      url.searchParams.set("moderationStatus", "rejected");

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

      await new Promise((resolve) => setTimeout(resolve, 300)); // Menghindari limit API (mencegah dugaan spam)
    }
  } catch (error) {
    logger(`❌ Error saat menghapus komentar: ${error.message}`);
  }
};
