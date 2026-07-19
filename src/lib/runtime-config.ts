const normalizeBaseUrl = (value?: string) => {
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
