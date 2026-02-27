import { EmployeeFilters, useEmployeeStore } from "@/stores";
import { companyKeys } from "./use-company";
import type {
  AllEmployeeResponse,
  CreateEmployeeType,
  EmployeeResponse,
  UpdateEmployeeType,
} from "@/validators";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

// Query keys
export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (filters: EmployeeFilters) =>
    [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

/**
 * Fetch employees with infinite scroll
 */
export function useEmployees() {
  const filters = useEmployeeStore((state) => state.filters);

  return useInfiniteQuery<AllEmployeeResponse>({
    queryKey: employeeKeys.list(filters),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();

      if (filters.companyId) params.append("companyId", filters.companyId);
      if (filters.search) params.append("search", filters.search);
      if (pageParam) params.append("cursor", pageParam as string);

      const { data } = await axios.get<AllEmployeeResponse>(
        `/api/employees?${params.toString()}`,
      );
      return data;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}

/**
 * Fetch single employee by ID
 */
export function useEmployee(id: string) {
  return useQuery<EmployeeResponse>({
    queryKey: employeeKeys.detail(id),
    queryFn: async () => {
      const { data } = await axios.get<EmployeeResponse>(
        `/api/employees/${id}`,
      );
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Create employee mutation
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation<EmployeeResponse, Error, CreateEmployeeType>({
    mutationFn: async (data) => {
      const { data: result } = await axios.post<EmployeeResponse>("/api/employees", data);
      return result;
    },
    onSuccess: () => {
      // Invalidate all employee list queries and company details (embedded employees)
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyKeys.details() });
    },
  });
}

/**
 * Update employee mutation
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation<
    EmployeeResponse,
    Error,
    { id: string; data: UpdateEmployeeType }
  >({
    mutationFn: async ({ id, data }) => {
      const { data: result } = await axios.put<EmployeeResponse>(`/api/employees/${id}`, data);
      return result;
    },
    onSuccess: (_, { id }) => {
      // Invalidate specific employee, all lists, and company details
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyKeys.details() });
    },
  });
}

/**
 * Delete employee mutation
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation<EmployeeResponse, Error, string>({
    mutationFn: async (id) => {
      const { data: result } = await axios.delete<EmployeeResponse>(`/api/employees/${id}`);
      return result;
    },
    onSuccess: (_, id) => {
      // Remove specific employee from cache, invalidate lists and company details
      queryClient.removeQueries({ queryKey: employeeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyKeys.details() });
    },
  });
}
