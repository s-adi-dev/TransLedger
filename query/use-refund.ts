import { tripKeys } from "@/query/use-trip";
import type {
  AllRefundsResponse,
  RefundInput,
  RefundsByCompanyResponse,
  RefundTripsByDateResponse,
  TripResponse,
  UpdateRefund,
} from "@/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { formatDate } from "date-fns";

// Query keys
export const refundKeys = {
  all: ["refunds"] as const,
  lists: () => [...refundKeys.all, "list"] as const,
  byCompany: (companyId: string) =>
    [...refundKeys.all, "company", companyId] as const,
  byCompanyAndDate: (companyId: string, date: string) =>
    [...refundKeys.all, "company", companyId, "date", date] as const,
};

/**
 * Invalidate all refund-related queries after a mutation
 */
function invalidateRefundQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  response: TripResponse,
) {
  if (response.trip?.id) {
    queryClient.invalidateQueries({ queryKey: tripKeys.detail(response.trip.id) });
  }
  queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
  queryClient.invalidateQueries({ queryKey: refundKeys.lists() });

  if (response.trip?.materialPayment?.partyId) {
    queryClient.invalidateQueries({
      queryKey: refundKeys.byCompany(response.trip.materialPayment.partyId),
    });
  }
  if (response.trip?.truckPayment?.partyId) {
    queryClient.invalidateQueries({
      queryKey: refundKeys.byCompany(response.trip.truckPayment.partyId),
    });
  }
}

/**
 * Fetch all refunds grouped by company
 */
export function useAllRefunds() {
  return useQuery<AllRefundsResponse>({
    queryKey: refundKeys.lists(),
    queryFn: async () => {
      const { data } = await axios.get<AllRefundsResponse>("/api/refunds");
      return data;
    },
  });
}

/**
 * Fetch refunds by company grouped by date
 */
export function useRefundsByCompany(companyId: string) {
  return useQuery<RefundsByCompanyResponse>({
    queryKey: refundKeys.byCompany(companyId),
    queryFn: async () => {
      const { data } = await axios.get<RefundsByCompanyResponse>(
        `/api/refunds/company/${companyId}`,
      );
      return data;
    },
    enabled: !!companyId,
  });
}

/**
 * Fetch refund trips by date for a specific company
 */
export function useRefundTripsByDate(companyId: string, date: Date | string) {
  const dateString = date instanceof Date ? formatDate(date, "yyyy-MM-dd") : date;

  return useQuery<RefundTripsByDateResponse>({
    queryKey: refundKeys.byCompanyAndDate(companyId, dateString),
    queryFn: async () => {
      const { data } = await axios.get<RefundTripsByDateResponse>(
        `/api/refunds/company/${companyId}/date/${dateString}`,
      );
      return data;
    },
    enabled: !!companyId && !!date,
  });
}

/**
 * Add refund mutation
 */
export function useAddRefund() {
  const queryClient = useQueryClient();

  return useMutation<TripResponse, Error, { paymentId: string; data: RefundInput }>({
    mutationFn: async ({ paymentId, data }) => {
      const { data: result } = await axios.post<TripResponse>("/api/refunds", { paymentId, ...data });
      return result;
    },
    onSuccess: (response) => invalidateRefundQueries(queryClient, response),
  });
}

/**
 * Update refund mutation
 */
export function useUpdateRefund() {
  const queryClient = useQueryClient();

  return useMutation<TripResponse, Error, { refundId: string; data: UpdateRefund }>({
    mutationFn: async ({ refundId, data }) => {
      const { data: result } = await axios.put<TripResponse>(`/api/refunds/${refundId}`, data);
      return result;
    },
    onSuccess: (response) => invalidateRefundQueries(queryClient, response),
  });
}

/**
 * Delete refund mutation
 */
export function useDeleteRefund() {
  const queryClient = useQueryClient();

  return useMutation<TripResponse, Error, string>({
    mutationFn: async (refundId) => {
      const { data: result } = await axios.delete<TripResponse>(`/api/refunds/${refundId}`);
      return result;
    },
    onSuccess: (response) => invalidateRefundQueries(queryClient, response),
  });
}
