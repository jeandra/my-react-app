import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setLogin: (token, user) => set({ token, user }),
      setLogout: () => set({ token: null, user: null })
    }),
    {
      name: 'postspace-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ token, user }) => ({ token, user })
    }
  )
);
