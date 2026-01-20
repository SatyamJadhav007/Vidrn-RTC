import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("Vidrn-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("Vidrn-theme", theme);
    set({ theme });
  },
}));
