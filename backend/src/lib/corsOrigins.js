const DEFAULT_ORIGINS = {
  development: ["http://localhost:5173"],
  production: ["https://vidrn-rtc.onrender.com"],
};

export function getCorsOrigins() {
  if (process.env.CORS_ORIGINS) {
    return process.env.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  return process.env.NODE_ENV === "production"
    ? DEFAULT_ORIGINS.production
    : DEFAULT_ORIGINS.development;
}
