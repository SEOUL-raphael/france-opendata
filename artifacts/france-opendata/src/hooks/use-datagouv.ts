import { useQuery } from "@tanstack/react-query";

const BASE_URL = "https://www.data.gouv.fr/api/1";

export const useSearchDatasets = (query: string, page = 1) => {
  return useQuery({
    queryKey: ["datasets", query, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        page: String(page),
        page_size: "20",
      });
      const res = await fetch(`${BASE_URL}/datasets/?${params}`);
      if (!res.ok) throw new Error("Failed to fetch datasets");
      return res.json();
    },
    enabled: true,
  });
};

export const useGetDataset = (id: string) => {
  return useQuery({
    queryKey: ["dataset", id],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/datasets/${id}/`);
      if (!res.ok) throw new Error("Failed to fetch dataset");
      return res.json();
    },
    enabled: !!id,
  });
};

export const usePortalStats = () => {
  return useQuery({
    queryKey: ["portal-stats"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/site/`);
      if (!res.ok) throw new Error("Failed to fetch portal stats");
      return res.json();
    },
  });
};

export const useSearchOrganizations = (query: string, page = 1) => {
  return useQuery({
    queryKey: ["organizations", query, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        page: String(page),
        page_size: "20",
      });
      const res = await fetch(`${BASE_URL}/organizations/?${params}`);
      if (!res.ok) throw new Error("Failed to fetch organizations");
      return res.json();
    },
  });
};

export const useGetOrganization = (id: string) => {
  return useQuery({
    queryKey: ["organization", id],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/organizations/${id}/`);
      if (!res.ok) throw new Error("Failed to fetch organization");
      return res.json();
    },
    enabled: !!id,
  });
};

export const useGetOrganizationDatasets = (id: string, page = 1) => {
  return useQuery({
    queryKey: ["organization-datasets", id, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: "20",
      });
      const res = await fetch(`${BASE_URL}/organizations/${id}/datasets/?${params}`);
      if (!res.ok) throw new Error("Failed to fetch organization datasets");
      return res.json();
    },
    enabled: !!id,
  });
};

export const useGetDataservices = (page = 1) => {
  return useQuery({
    queryKey: ["dataservices", page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: "20",
      });
      const res = await fetch(`${BASE_URL}/dataservices/?${params}`);
      if (!res.ok) throw new Error("Failed to fetch dataservices");
      return res.json();
    },
  });
};
