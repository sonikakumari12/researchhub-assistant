import { apiFetch } from './client';

export type Paper = {
  title: string;
  content: string;
};

export type PaperSearchResult = {
  summary: string;
  source: 'arxiv' | 'pubmed';
  external_id: string;
  title: string;
  abstract?: string | null;
  authors: string[];
  published_at?: string | null;
};

export type PaperSearchResponse = {
  results: PaperSearchResult[];
};

export async function getPapers(token: string | null) {
  return apiFetch<Paper[]>('/papers', {}, token);
}

export async function searchPapers(
  source: 'arxiv' | 'pubmed',
  q: string,
  maxResults: number,
  token: string | null,
) {
  const params = new URLSearchParams({
    source,
    q,
    max_results: String(maxResults),
  });

  return apiFetch<PaperSearchResponse>(`/papers/search?${params.toString()}`, {}, token);
}

export async function oneClickImport(
  source: 'arxiv' | 'pubmed',
  externalId: string,
  token: string | null,
) {
  return apiFetch(
    '/papers/import/one-click',
    {
      method: 'POST',
      body: JSON.stringify({ source, external_id: externalId }),
    },
    token,
  );
}
export async function getAISummary(
  text: string,
  token: string
) {
  return apiFetch<{ summary: string }>(
    "/summary",
    {
      method: "POST",
      body: JSON.stringify({ text }),
    },
    token
  );
}

export async function uploadPdf(
  file: File,
  token: string | null,
) {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch<{ id: number; title: string; content: string }>(
    '/papers/upload',
    {
      method: 'POST',
      body: formData,
    },
    token,
  );
}
