import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = axios.create({ baseURL: API_URL });

// Turn an axios error into something a person can act on. A CORS block or a
// stopped server both arrive as "no response", so name that case explicitly.
export function errorMessage(err, fallback) {
  if (err.response) {
    const detail = err.response.data?.detail;
    if (typeof detail === "string") return detail;
    return `${fallback} The server answered with status ${err.response.status}.`;
  }
  if (err.request) {
    return `Couldn't reach the backend at ${API_URL}. Check that it's running (uvicorn main:app --port 8000).`;
  }
  return fallback;
}
