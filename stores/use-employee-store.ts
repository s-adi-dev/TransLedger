import { create } from "zustand";

export interface EmployeeFilters {
  companyId?: string;
  search?: string;
}

interface EmployeeStore {
  filters: EmployeeFilters;
  setFilters: (filters: EmployeeFilters) => void;
  setCompanyId: (companyId: string | undefined) => void;
  setSearch: (search: string | undefined) => void;
  clearFilters: () => void;
}

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
  setCompanyId: (companyId) =>
    set((state) => ({ filters: { ...state.filters, companyId } })),
  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),
  clearFilters: () => set({ filters: {} }),
}));
