import type {
  AllPaymentsResponse,
  PaymentsByCompanyResponse,
  PaymentTripsByDateResponse,
} from "@/validators";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { formatDate } from "date-fns";

// Query keys
export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  byCompany: (companyId: string) =>
    [...paymentKeys.all, "company", companyId] as const,
  byCompanyTypeDate: (companyId: string, type: string, date: string) =>
    [...paymentKeys.all, "company", companyId, type, date] as const,
};

/**
 * Fetch all payments grouped by company
 */
export function useAllPayments() {
  return useQuery<AllPaymentsResponse>({
    queryKey: paymentKeys.lists(),
    queryFn: async () => {
      const { data } = await axios.get<AllPaymentsResponse>("/api/payments");
      return data;
    },
  });
}

/**
 * Fetch payments by company grouped by date (advance and balance)
 */
export function usePaymentsByCompany(companyId: string) {
  return useQuery<PaymentsByCompanyResponse>({
    queryKey: paymentKeys.byCompany(companyId),
    queryFn: async () => {
      const { data } = await axios.get<PaymentsByCompanyResponse>(
        `/api/payments/company/${companyId}`,
      );
      return data;
    },
    enabled: !!companyId,
  });
}

/**
 * Fetch payment trips by type and date for a specific company
 */
export function usePaymentTripsByDate(
  companyId: string,
  type: "advance" | "balance",
  date: Date | string,
) {
  const dateString =
    date instanceof Date ? formatDate(date, "yyyy-MM-dd") : date;

  return useQuery<PaymentTripsByDateResponse>({
    queryKey: paymentKeys.byCompanyTypeDate(companyId, type, dateString),
    queryFn: async () => {
      const { data } = await axios.get<PaymentTripsByDateResponse>(
        `/api/payments/company/${companyId}/${type}/${dateString}`,
      );
      return data;
    },
    enabled: !!companyId && !!type && !!date,
  });
}
