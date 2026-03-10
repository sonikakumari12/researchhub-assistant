import { apiFetch } from './client';

export type Document = {
  id: number;
  title: string;
  content: string;
  workspace_id?: number | null;
};

export async function getDocuments(
  token: string | null,
  workspaceId?: number | null,
) {
  const params = workspaceId ? `?workspace_id=${workspaceId}` : '';
  return apiFetch<Document[]>(`/documents${params}`, {}, token);
}

export async function createDocument(
  payload: { title: string; content: string; workspace_id?: number | null },
  token: string | null,
) {
  return apiFetch<Document>(
    '/documents',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token,
  );
}

export async function updateDocument(
  documentId: number,
  payload: { title?: string; content?: string; workspace_id?: number | null },
  token: string | null,
) {
  return apiFetch<Document>(
    `/documents/${documentId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    token,
  );
}
