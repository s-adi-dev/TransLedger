import { PartyType } from "@/validators";
import { create } from "zustand";

export interface CompanyFilters {
  type?: PartyType;
  search?: string;
}

interface CompanyStore {
  filters: CompanyFilters;
  setFilters: (filters: CompanyFilters) => void;
  setType: (type: PartyType | undefined) => void;
  setSearch: (search: string | undefined) => void;
  clearFilters: () => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
  setType: (type) => set((state) => ({ filters: { ...state.filters, type } })),
  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),
  clearFilters: () => set({ filters: {} }),
}));
