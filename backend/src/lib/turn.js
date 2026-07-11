import crypto from "crypto";

/**
 * Generate time-limited TURN credentials using the coturn REST API / shared-secret
 * mechanism (RFC 5766 / coturn use-auth-secret mode).
 *
 * How it works:
 *   1. username = "<expiry-unix-timestamp>:<userId>"
 *      The expiry timestamp is what makes the credential expire — coturn rejects
 *      any credential whose embedded timestamp is in the past.
 *
 *   2. password = Base64( HMAC-SHA1(username, TURN_SECRET) )
 *      coturn independently computes the same HMAC using its own copy of TURN_SECRET.
 *      No database lookup needed on the TURN server.
 *
 *   3. The frontend passes { username, credential: password } in RTCPeerConnection
 *      iceServers, valid only for the duration of the call window.
 *
 * Security properties:
 *   - Credentials expire automatically after `ttlSeconds`
 *   - The shared secret (TURN_SECRET) is never sent to the client
 *   - Each call gets fresh credentials; no static/leakable password in frontend code
 *
 * @param {string} userId   - MongoDB user ID, embedded in the username for audit
 * @param {number} ttlSeconds - Credential validity window (default: 1 hour)
 * @returns {{ username: string, credential: string, urls: string[] }}
 */
export function generateTurnCredentials(userId, ttlSeconds = 3600) {
  const turnSecret = process.env.TURN_SECRET;
  const turnUrl = process.env.TURN_URL; // e.g. "turn:3.x.x.x:3478"

  if (!turnSecret || !turnUrl) {
    return null; // TURN not configured — caller falls back to STUN-only
  }

  // Expiry = now + TTL (Unix seconds)
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;

  // Username encodes the expiry AND the user ID (for server-side audit logs)
  const username = `${expiry}:${userId}`;

  // HMAC-SHA1 of username, keyed by the shared secret
  const credential = crypto
    .createHmac("sha1", turnSecret)
    .update(username)
    .digest("base64");

  return {
    username,
    credential,
    // Provide both TURN and STUN variants of the same server
    // so the browser's ICE stack has the full candidate ladder
    urls: [
      turnUrl,                              // e.g. turn:3.x.x.x:3478
      turnUrl.replace("turn:", "turns:"),   // TLS variant (coturn also listens on 5349 if configured)
      turnUrl.replace("turn:", "stun:"),    // same host as STUN fallback
    ],
  };
}
