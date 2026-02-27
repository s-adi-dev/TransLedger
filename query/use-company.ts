import { CompanyFilters, useCompanyStore } from "@/stores";
import type {
  AllCompanyResponse,
  CompanyListResponse,
  CompanyResponse,
  CreateCompanyType,
  UpdateCompanyType,
} from "@/validators";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

// Query keys
export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (filters: CompanyFilters) => [...companyKeys.lists(), filters] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
};

/**
 * Fetch companies with infinite scroll
 */
export function useCompanies() {
  const filters = useCompanyStore((state) => state.filters);

  return useInfiniteQuery<AllCompanyResponse>({
    queryKey: companyKeys.list(filters),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();

      if (filters.type) params.append("type", filters.type);
      if (filters.search) params.append("search", filters.search);
      if (pageParam) params.append("cursor", pageParam as string);

      const { data } = await axios.get<AllCompanyResponse>(
        `/api/companies?${params.toString()}`,
      );
      return data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}

/**
 * Fetch company list (id, name, type only)
 */
export function useCompanyList() {
  return useQuery({
    queryKey: [...companyKeys.all, "list-all"] as const,
    queryFn: async () => {
      const { data } = await axios.get<CompanyListResponse>(
        "/api/companies/list",
      );
      return data;
    },
  });
}

/**
 * Fetch single company by ID
 */
export function useCompany(id: string) {
  return useQuery<CompanyResponse>({
    queryKey: companyKeys.detail(id),
    queryFn: async () => {
      const { data } = await axios.get<CompanyResponse>(`/api/companies/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Create company mutation
 */
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation<CompanyResponse, Error, CreateCompanyType>({
    mutationFn: async (data) => {
      const { data: result } = await axios.post<CompanyResponse>("/api/companies", data);
      return result;
    },
    onSuccess: () => {
      // Invalidate all company list queries
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

/**
 * Update company mutation
 */
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation<
    CompanyResponse,
    Error,
    { id: string; data: UpdateCompanyType }
  >({
    mutationFn: async ({ id, data }) => {
      const { data: result } = await axios.put<CompanyResponse>(`/api/companies/${id}`, data);
      return result;
    },
    onSuccess: (_, { id }) => {
      // Invalidate specific company and all lists
      queryClient.invalidateQueries({ queryKey: companyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

/**
 * Delete company mutation
 */
export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation<CompanyResponse, Error, string>({
    mutationFn: async (id) => {
      const { data: result } = await axios.delete<CompanyResponse>(`/api/companies/${id}`);
      return result;
    },
    onSuccess: (_, id) => {
      // Remove specific company from cache and invalidate lists
      queryClient.removeQueries({ queryKey: companyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}
