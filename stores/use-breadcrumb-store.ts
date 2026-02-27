import { create } from "zustand";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbStore {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
  removeBreadcrumb: (index: number) => void;
  clearBreadcrumbs: () => void;
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  breadcrumbs: [],
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  addBreadcrumb: (breadcrumb) =>
    set((state) => ({ breadcrumbs: [...state.breadcrumbs, breadcrumb] })),
  removeBreadcrumb: (index) =>
    set((state) => ({
      breadcrumbs: state.breadcrumbs.filter((_, i) => i !== index),
    })),
  clearBreadcrumbs: () => set({ breadcrumbs: [] }),
}));
