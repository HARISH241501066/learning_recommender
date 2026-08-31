// Central API config: uses VITE_API_BASE_URL if configured in environment, else relative path
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
