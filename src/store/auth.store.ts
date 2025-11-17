import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type User = {
    id: string;
    name: string;
    email: string;
};

type AuthStore = {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
    devtools(
        persist(
            (set) => ({
                user: null,
                login: (user: User) => set({ user }),
                logout: () => set({ user: null }),
            }),
            {
                name: 'auth-storage',
            },
        ),
    ),
);
