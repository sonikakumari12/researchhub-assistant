import { apiFetch } from './client';

export async function chat(message: string, token: string | null) {
  return apiFetch<{ response: string }>(
    '/chat',
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    },
    token,
  );
}