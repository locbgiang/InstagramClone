const API_URL = import.meta.env.VITE_API_URL || "";

export { API_URL };

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export function uploadsUrl(filename: string): string {
  return `${API_URL}/uploads/${filename}`;
}
