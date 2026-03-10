import { apiFetch } from './client';

export type Workspace = {
  id: number;
  name: string;
  description?: string | null;
  papers?: number | null;
  createdAt?: string | null;
};

export async function getWorkspaces(token: string | null) {
  return apiFetch<Workspace[]>('/workspaces', {}, token);
}

export async function getWorkspace(workspaceId: number, token: string | null) {
  return apiFetch<Workspace>(`/workspaces/${workspaceId}`, {}, token);
}

export async function createWorkspace(
  name: string,
  description: string | null,
  token: string | null,
) {
  return apiFetch<Workspace>(
    '/workspaces',
    {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    },
    token,
  );
}
