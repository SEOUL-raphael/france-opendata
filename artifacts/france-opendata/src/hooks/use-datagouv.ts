import { useQuery } from "@tanstack/react-query";
import type {
  DGDataset,
  DGOrganization,
  DGDataservice,
  DGPagedResult,
  DGSiteStats,
} from "@/types/datagouv";

const BASE_URL = "https://www.data.gouv.fr/api/1";

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const useSearchDatasets = (query: string, page = 1) => {
  return useQuery<DGPagedResult<DGDataset>>({
    queryKey: ["datasets", query, page],
    queryFn: () => {
      const params = new URLSearchParams({
        q: query,
        page: String(page),
        page_size: "20",
      });
      return apiFetch<DGPagedResult<DGDataset>>(`${BASE_URL}/datasets/?${params}`);
    },
    enabled: true,
  });
};

export const useGetDataset = (id: string) => {
  return useQuery<DGDataset>({
    queryKey: ["dataset", id],
    queryFn: () => apiFetch<DGDataset>(`${BASE_URL}/datasets/${id}/`),
    enabled: !!id,
  });
};

export const usePortalStats = () => {
  return useQuery<DGSiteStats>({
    queryKey: ["portal-stats"],
    queryFn: () => apiFetch<DGSiteStats>(`${BASE_URL}/site/`),
  });
};

export const useSearchOrganizations = (query: string, page = 1) => {
  return useQuery<DGPagedResult<DGOrganization>>({
    queryKey: ["organizations", query, page],
    queryFn: () => {
      const params = new URLSearchParams({
        q: query,
        page: String(page),
        page_size: "20",
      });
      return apiFetch<DGPagedResult<DGOrganization>>(`${BASE_URL}/organizations/?${params}`);
    },
  });
};

export const useGetOrganization = (id: string) => {
  return useQuery<DGOrganization>({
    queryKey: ["organization", id],
    queryFn: () => apiFetch<DGOrganization>(`${BASE_URL}/organizations/${id}/`),
    enabled: !!id,
  });
};

export const useGetOrganizationDatasets = (id: string, page = 1) => {
  return useQuery<DGPagedResult<DGDataset>>({
    queryKey: ["organization-datasets", id, page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: "20",
      });
      return apiFetch<DGPagedResult<DGDataset>>(
        `${BASE_URL}/organizations/${id}/datasets/?${params}`
      );
    },
    enabled: !!id,
  });
};

export const useGetDataservices = (page = 1) => {
  return useQuery<DGPagedResult<DGDataservice>>({
    queryKey: ["dataservices", page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: "20",
      });
      return apiFetch<DGPagedResult<DGDataservice>>(`${BASE_URL}/dataservices/?${params}`);
    },
  });
};
