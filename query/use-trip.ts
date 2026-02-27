import { TripFilters, useTripStore } from "@/stores";
import type {
  AllTripResponse,
  BiltiInput,
  CreateTripType,
  LocationsResponse,
  TripResponse,
  UpdateBilti,
  UpdatePartyPayment,
  UpdateTripType,
  PartyType,
} from "@/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Query keys
export const tripKeys = {
  all: ["trips"] as const,
  lists: () => [...tripKeys.all, "list"] as const,
  list: (filters: TripFilters, page: number, limit: number) =>
    [...tripKeys.lists(), { filters, page, limit }] as const,
  details: () => [...tripKeys.all, "detail"] as const,
  detail: (id: string) => [...tripKeys.details(), id] as const,
  locations: () => [...tripKeys.all, "locations"] as const,
};

/**
 * Fetch trips with pagination
 */
export function useTrips() {
  const filters = useTripStore((state) => state.filters);
  const page = useTripStore((state) => state.page);
  const limit = useTripStore((state) => state.limit);

  return useQuery<AllTripResponse>({
    queryKey: tripKeys.list(filters, page, limit),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.truckNo) params.append("truckNo", filters.truckNo);
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.dateFrom)
        params.append("dateFrom", filters.dateFrom.toISOString());
      if (filters.dateTo) params.append("dateTo", filters.dateTo.toISOString());
      if (filters.biltiStatus)
        params.append("biltiStatus", filters.biltiStatus);
      if (filters.paymentStatus)
        params.append("paymentStatus", filters.paymentStatus);
      if (filters.materialPartyId)
        params.append("materialPartyId", filters.materialPartyId);
      if (filters.truckPartyId)
        params.append("truckPartyId", filters.truckPartyId);

      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const { data } = await axios.get<AllTripResponse>(
        `/api/trips?${params.toString()}`,
      );
      return data;
    },
  });
}

/**
 * Fetch single trip by ID
 */
export function useTrip(id: string) {
  return useQuery<TripResponse>({
    queryKey: tripKeys.detail(id),
    queryFn: async () => {
      const { data } = await axios.get<TripResponse>(`/api/trips/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Create trip mutation
 */
export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation<TripResponse, Error, CreateTripType>({
    mutationFn: async (data) => {
      const { data: result } = await axios.post<TripResponse>("/api/trips", data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    },
  });
}

/**
 * Update trip mutation
 */
export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation<TripResponse, Error, { id: string; data: UpdateTripType }>(
    {
      mutationFn: async ({ id, data }) => {
        const { data: result } = await axios.put<TripResponse>(`/api/trips/${id}`, data);
        return result;
      },
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: tripKeys.detail(id) });
        queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      },
    },
  );
}

/**
 * Delete trip mutation
 */
export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation<TripResponse, Error, string>({
    mutationFn: async (id) => {
      const { data: result } = await axios.delete<TripResponse>(`/api/trips/${id}`);
      return result;
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: tripKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    },
  });
}

/**
 * Add bilti mutation
 */
export function useAddBilti() {
  const queryClient = useQueryClient();

  return useMutation<TripResponse, Error, { tripId: string; data: BiltiInput }>(
    {
      mutationFn: async ({ tripId, data }) => {
        const { data: result } = await axios.post<TripResponse>(`/api/trips/${tripId}/bilti`, data);
        return result;
      },
      onSuccess: (_, { tripId }) => {
        queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
        queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
      },
    },
  );
}

/**
 * Update bilti mutation
 */
export function useUpdateBilti() {
  const queryClient = useQueryClient();

  return useMutation<
    TripResponse,
    Error,
    { tripId: string; data: UpdateBilti }
  >({
    mutationFn: async ({ tripId, data }) => {
      const { data: result } = await axios.put<TripResponse>(`/api/trips/${tripId}/bilti`, data);
      return result;
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    },
  });
}

/**
 * Update payment mutation
 */
export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation<
    TripResponse,
    Error,
    { tripId: string; data: UpdatePartyPayment; type: PartyType }
  >({
    mutationFn: async ({ tripId, data, type }) => {
      const { data: result } = await axios.put<TripResponse>(`/api/trips/${tripId}/payment`, { type, ...data });
      return result;
    },
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    },
  });
}

/**
 * Fetch unique locations from all trips
 */
export function useLocations() {
  return useQuery<LocationsResponse>({
    queryKey: tripKeys.locations(),
    queryFn: async () => {
      const { data } = await axios.get<LocationsResponse>(
        "/api/trips/locations",
      );
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - locations don't change frequently
  });
}
