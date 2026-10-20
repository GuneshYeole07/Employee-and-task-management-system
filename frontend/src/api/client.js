import axios from 'axios';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 20000 });

export const getErrorMessage = (err) =>
  err?.response?.data?.message ||
  (err?.request ? 'Cannot reach the server. Please check your connection and try again.' : err?.message || 'Something went wrong.');

export const getFieldErrors = (err) => err?.response?.data?.errors || [];

/** Blob responses hide the JSON error body; unwrap it so the friendly message still shows. */
export async function getBlobErrorMessage(err) {
  const data = err?.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text()).message;
    } catch {
      return 'Export failed.';
    }
  }
  return getErrorMessage(err);
}
