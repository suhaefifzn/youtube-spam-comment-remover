/**
 * Lihat: https://developers.google.com/youtube/v3/guides/auth/client-side-web-apps
 */

const SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"];
const CREDENTIAL_KEY = "credentials.json";
const TOKEN_KEY = "token.json";
const AUTH_ROUTE = ":5173/oauth";

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

  const redirect_uri = redirect_uris[0] + AUTH_ROUTE;
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

/**
 * Digunakan untuk membuat url otorisasi
 */
export const getAuthUrl = () => {
  const credentialRaw = localStorage.getItem(CREDENTIAL_KEY);
  if (!credentialRaw) return "#";
  const credentials = JSON.parse(credentialRaw);

  const { client_id, redirect_uris } = credentials.installed || {};
  const redirect_uri = redirect_uris[0] + AUTH_ROUTE;

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

/**
 * Untuk generate akses token
 * Gunakan setelah user login dan mendapatkan otorisasi kode
 */
export const generateNewToken = async (code) => {
  const credentialRaw = localStorage.getItem(CREDENTIAL_KEY);
  if (!credentialRaw) throw new Error("Credentials tidak ditemukan");

  const credentials = JSON.parse(credentialRaw);
  const { client_id, client_secret, redirect_uris } =
    credentials.installed || {};
  const redirect_uri = redirect_uris[0] + AUTH_ROUTE;

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

/**
 * Digunakan untuk memperbarui akses token yang kadaluarsa
 */
export const refreshAccessToken = async () => {
  const credentialRaw = localStorage.getItem(CREDENTIAL_KEY);
  if (!credentialRaw) throw new Error("Credentials tidak ditemukan");

  const credentials = JSON.parse(credentialRaw);
  const { client_id, client_secret } = credentials.installed || {};

  const tokenRaw = localStorage.getItem(TOKEN_KEY);
  if (!tokenRaw) throw new Error("Token belum tersedia");

  const tokens = JSON.parse(tokenRaw);

  const params = new URLSearchParams({
    client_id,
    client_secret,
    refresh_token: tokens.refresh_token,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    console.error("Gagal refresh token:", await response.json());
    throw new Error("Gagal refresh token");
  }

  const credentialsUpdate = await response.json();
  credentialsUpdate.created_at = Math.floor(Date.now() / 1000);

  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({
      ...tokens,
      ...credentialsUpdate,
    })
  );

  return credentialsUpdate;
};

/**
 * Untuk memastikan apakah token kadaluarsa
 */
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

/**
 * Mendapatkan akses token secara langsung
 */
export const getAccessToken = () => {
  const tokenData = localStorage.getItem(TOKEN_KEY);

  if (!tokenData) {
    alert("Token belum tersedia. Silahkan generate token terlebih dahulu.");
    throw new Error("Token tidak ditemukan");
  }

  return JSON.parse(tokenData).access_token;
};
