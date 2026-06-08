import axios from 'axios';
import toast from 'react-hot-toast';

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (Array.isArray(msg)) return msg[0];
    if (typeof msg === 'string') return msg;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export function toastError(err: unknown, fallback?: string): void {
  toast.error(getErrorMessage(err, fallback));
}
