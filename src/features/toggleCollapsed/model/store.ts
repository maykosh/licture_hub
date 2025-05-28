import { create } from "zustand";

interface CollapsedStore {
   collapsed: boolean;
   setCollapsed: (collapsed: boolean) => void;
}
export const useToggleCollapsedStore = create<CollapsedStore>((set) => ({
   collapsed: false,
   setCollapsed: (collapsed: boolean) => set({ collapsed }),
}));
