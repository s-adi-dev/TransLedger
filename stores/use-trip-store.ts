import { BiltiStatus, PaymentStatus } from "@/validators";
import { create } from "zustand";

export interface TripFilters {
  search?: string;
  truckNo?: string;
  from?: string;
  to?: string;
  dateFrom?: Date;
  dateTo?: Date;
  biltiStatus?: BiltiStatus;
  paymentStatus?: PaymentStatus;
  materialPartyId?: string;
  truckPartyId?: string;
}

interface TripStore {
  filters: TripFilters;
  page: number;
  limit: number;
  selectedTripId: string | null;
  setFilters: (filters: TripFilters) => void;
  setSearch: (search: string | undefined) => void;
  setTruckNo: (truckNo: string | undefined) => void;
  setFrom: (from: string | undefined) => void;
  setTo: (to: string | undefined) => void;
  setDateRange: (dateFrom?: Date, dateTo?: Date) => void;
  setBiltiStatus: (status: BiltiStatus | undefined) => void;
  setPaymentStatus: (status: PaymentStatus | undefined) => void;
  setMaterialPartyId: (materialPartyId: string | undefined) => void;
  setTruckPartyId: (truckPartyId: string | undefined) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  clearFilters: () => void;
  resetPagination: () => void;
  setSelectedTripId: (tripId: string | null) => void;
}

export const useTripStore = create<TripStore>((set) => ({
  filters: {},
  page: 1,
  limit: 20,
  selectedTripId: null,
  setFilters: (filters) => set({ filters, page: 1 }),
  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search }, page: 1 })),
  setTruckNo: (truckNo) =>
    set((state) => ({ filters: { ...state.filters, truckNo }, page: 1 })),
  setFrom: (from) =>
    set((state) => ({ filters: { ...state.filters, from }, page: 1 })),
  setTo: (to) =>
    set((state) => ({ filters: { ...state.filters, to }, page: 1 })),
  setDateRange: (dateFrom, dateTo) =>
    set((state) => ({
      filters: { ...state.filters, dateFrom, dateTo },
      page: 1,
    })),
  setBiltiStatus: (biltiStatus) =>
    set((state) => ({ filters: { ...state.filters, biltiStatus }, page: 1 })),
  setPaymentStatus: (paymentStatus) =>
    set((state) => ({
      filters: { ...state.filters, paymentStatus },
      page: 1,
    })),
  setMaterialPartyId: (materialPartyId) =>
    set((state) => ({
      filters: { ...state.filters, materialPartyId },
      page: 1,
    })),
  setTruckPartyId: (truckPartyId) =>
    set((state) => ({ filters: { ...state.filters, truckPartyId }, page: 1 })),
  setPage: (page) => set({ page }),
  setLimit: (limit) => set({ limit, page: 1 }),
  clearFilters: () => set({ filters: {}, page: 1 }),
  resetPagination: () => set({ page: 1 }),
  setSelectedTripId: (tripId) => set({ selectedTripId: tripId }),
}));
