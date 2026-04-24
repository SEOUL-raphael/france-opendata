export interface DGResource {
  id: string;
  title: string | null;
  url: string;
  format: string | null;
  filesize: number | null;
  mime: string | null;
  created_at: string;
  last_modified: string | null;
  description: string | null;
  type: string;
}

export interface DGOrganizationRef {
  id: string;
  name: string;
  acronym: string | null;
  logo: string | null;
  logo_thumbnail: string | null;
  page: string;
}

export interface DGDataset {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  created_at: string;
  last_modified: string | null;
  last_update: string | null;
  frequency: string | null;
  license: string | null;
  page: string;
  private: boolean;
  metrics: {
    discussions: number;
    followers: number;
    reuses: number;
    views: number;
  } | null;
  organization: DGOrganizationRef | null;
  resources: DGResource[];
  tags: string[];
  temporal_coverage: { start: string | null; end: string | null } | null;
}

export interface DGOrganization {
  id: string;
  name: string;
  slug: string;
  acronym: string | null;
  description: string | null;
  logo: string | null;
  logo_thumbnail: string | null;
  page: string;
  website: string | null;
  created_at: string;
  metrics: {
    datasets: number;
    followers: number;
    members: number;
    reuses: number;
    views: number;
  } | null;
  members: Array<{ user: { id: string; first_name: string; last_name: string } }> | null;
  badges: Array<{ kind: string }> | null;
  zone: string | null;
}

export interface DGDataservice {
  id: string;
  title: string;
  acronym: string | null;
  description: string | null;
  base_api_url: string | null;
  endpoint_description_url: string | null;
  contact_point: string | null;
  license: string | null;
  created_at: string;
  metadata_modified_at: string | null;
  organization: DGOrganizationRef | null;
  tags: string[];
  page: string | null;
  is_restricted: boolean;
  private?: boolean;
}

export interface DGPagedResult<T> {
  data: T[];
  next_page: string | null;
  previous_page: string | null;
  page: number;
  page_size: number;
  total: number;
}

export interface DGSiteStats {
  datasets: number;
  discussions: number;
  followers: number;
  organizations: number;
  reuses: number;
  resources: number;
  dataservices: number;
  metrics: {
    datasets: number;
    organizations: number;
    dataservices: number;
    reuses: number;
    resources: number;
    followers: number;
    views: number;
  } | null;
}
