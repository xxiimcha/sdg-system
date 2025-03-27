import { create } from "zustand";

interface SidebarState {
  openDropdown: string | null;
  setOpenDropdown: (menu: string | null) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  openDropdown: null,
  setOpenDropdown: (menu) =>
    set((state) => ({
      openDropdown: state.openDropdown === menu ? null : menu,
    })),
}));
