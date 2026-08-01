const normalizeBaseUrl = (value?: string) => {
  // Always use relative URLs in the browser so that Next.js proxy (rewrites) 
  // handles the request. This avoids cross-origin/third-party cookie blocking.
  if (typeof window !== "undefined") return "";

  if (!value) return "https://medimind-server.vercel.app";

  const trimmed = value.trim();
  if (!trimmed) return "https://medimind-server.vercel.app";

  return trimmed.replace(/\/api\/?$/, "");
};

export const getApiBaseUrl = () =>
  normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
export const getAuthBaseUrl = () =>
  normalizeBaseUrl(process.env.NEXT_PUBLIC_BETTER_AUTH_URL);
export const getApiUrl = () => `${getApiBaseUrl()}/api`;
