import { useAuthStore } from '../stores/auth';

export function useAuth() {
  const authStore = useAuthStore();

  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    codigoEmpresa: authStore.codigoEmpresa,
    login: authStore.login,
    logout: authStore.logout,
  };
}