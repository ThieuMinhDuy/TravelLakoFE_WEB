export const env = {
  API_BASE_URL:
    import.meta.env.VITE_API_URL || 'https://travellako-backend.onrender.com/api',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
} as const;
