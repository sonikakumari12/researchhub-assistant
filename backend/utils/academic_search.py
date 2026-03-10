import os
import xml.etree.ElementTree as ET
from typing import List, Optional

import httpx
from dotenv import load_dotenv

from backend.schemas import (
    PaperMetadata,
    PaperSearchResult,
    PaperSource,
)


load_dotenv()

ARXIV_API_URL = os.getenv("ARXIV_API_URL", "https://export.arxiv.org/api/query")
PUBMED_API_KEY = os.getenv("PubMed_API_KEY")

PUBMED_SEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_SUMMARY_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
PUBMED_FETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"


async def search_papers(
    source: PaperSource, query: str, max_results: int = 10
) -> List[PaperSearchResult]:
    if source == PaperSource.arxiv:
        return await _search_arxiv(query=query, max_results=max_results)
    if source == PaperSource.pubmed:
        return await _search_pubmed(query=query, max_results=max_results)

    raise ValueError(f"Unsupported source: {source}")


async def fetch_paper_by_id(
    source: PaperSource, external_id: str
) -> Optional[PaperMetadata]:
    if source == PaperSource.arxiv:
        return await _fetch_arxiv_paper(external_id)
    if source == PaperSource.pubmed:
        return await _fetch_pubmed_paper(external_id)

    raise ValueError(f"Unsupported source: {source}")


async def _search_arxiv(query: str, max_results: int) -> List[PaperSearchResult]:
    params = {
        "search_query": query,
        "start": 0,
        "max_results": max_results,
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(ARXIV_API_URL, params=params)
        response.raise_for_status()

    root = ET.fromstring(response.text)
    ns = {"atom": "http://www.w3.org/2005/Atom"}

    results: List[PaperSearchResult] = []

    for entry in root.findall("atom:entry", ns):
        paper_id = entry.findtext("atom:id", default="", namespaces=ns)
        external_id = paper_id.split("/")[-1] if paper_id else ""

        title = entry.findtext("atom:title", default="", namespaces=ns).strip()
        abstract = entry.findtext("atom:summary", default="", namespaces=ns).strip()
        published_at = entry.findtext("atom:published", default="", namespaces=ns)

        authors: List[str] = []
        for author_elem in entry.findall("atom:author", ns):
            name = author_elem.findtext("atom:name", default="", namespaces=ns)
            if name:
                authors.append(name)

        results.append(
            PaperSearchResult(
                source=PaperSource.arxiv,
                external_id=external_id,
                title=title,
                abstract=abstract or None,
                authors=authors,
                published_at=published_at,
            )
        )

    return results


async def _search_pubmed(query: str, max_results: int) -> List[PaperSearchResult]:
    params = {
        "db": "pubmed",
        "term": query,
        "retmax": max_results,
        "retmode": "json",
    }

    if PUBMED_API_KEY:
        params["api_key"] = PUBMED_API_KEY

    async with httpx.AsyncClient(timeout=10,follow_redirects=True) as client:
        search_resp = await client.get(PUBMED_SEARCH_URL, params=params)
        search_resp.raise_for_status()
        search_data = search_resp.json()

    id_list = search_data.get("esearchresult", {}).get("idlist", [])
    if not id_list:
        return []

    summary_params = {
        "db": "pubmed",
        "id": ",".join(id_list),
        "retmode": "json",
    }
    if PUBMED_API_KEY:
        summary_params["api_key"] = PUBMED_API_KEY

    async with httpx.AsyncClient(timeout=10) as client:
        summary_resp = await client.get(PUBMED_SUMMARY_URL, params=summary_params)
        summary_resp.raise_for_status()
        summary_data = summary_resp.json()

    summary_result = summary_data.get("result", {})

    results: List[PaperSearchResult] = []

    for pmid in id_list:
        doc = summary_result.get(pmid, {})

        title = doc.get("title", "")
        pubdate = doc.get("pubdate") or doc.get("sortpubdate")

        authors: List[str] = []
        for a in doc.get("authors", []):
            name = a.get("name")
            if name:
                authors.append(name)

        results.append(
            PaperSearchResult(
                source=PaperSource.pubmed,
                external_id=pmid,
                title=title,
                abstract=None,
                authors=authors,
                published_at=pubdate,
            )
        )

    return results


async def _fetch_arxiv_paper(external_id: str) -> Optional[PaperMetadata]:
    params = {
        "search_query": f"id:{external_id}",
        "start": 0,
        "max_results": 1,
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(ARXIV_API_URL, params=params)
        response.raise_for_status()

    root = ET.fromstring(response.text)
    ns = {"atom": "http://www.w3.org/2005/Atom"}

    entry = root.find("atom:entry", ns)
    if entry is None:
        return None

    title = entry.findtext("atom:title", default="", namespaces=ns).strip()
    abstract = entry.findtext("atom:summary", default="", namespaces=ns).strip()

    return PaperMetadata(
        source=PaperSource.arxiv,
        external_id=external_id,
        title=title,
        abstract=abstract or None,
    )


async def _fetch_pubmed_paper(external_id: str) -> Optional[PaperMetadata]:
    params = {
        "db": "pubmed",
        "id": external_id,
        "retmode": "xml",
    }
    if PUBMED_API_KEY:
        params["api_key"] = PUBMED_API_KEY

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(PUBMED_FETCH_URL, params=params)
        response.raise_for_status()

    root = ET.fromstring(response.text)

    article_title = root.findtext(".//ArticleTitle", default="").strip()

    abstract_parts: List[str] = []
    for abst in root.findall(".//AbstractText"):
        part_text = "".join(abst.itertext()).strip()
        if part_text:
            abstract_parts.append(part_text)

    abstract = "\n\n".join(abstract_parts) if abstract_parts else None

    if not article_title and not abstract:
        return None

    return PaperMetadata(
        source=PaperSource.pubmed,
        external_id=external_id,
        title=article_title,
        abstract=abstract,
    )

