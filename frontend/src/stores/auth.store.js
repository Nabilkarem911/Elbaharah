import { defineStore } from 'pinia';
import api from '../api';
import { resetOrgLabels } from '../composables/useOrgLabels';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    superAdminToken: localStorage.getItem('super_admin_token') || null,
    superAdminUser: JSON.parse(localStorage.getItem('super_admin_user') || 'null'),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isSuperAdmin: (state) => state.user?.role === 'super_admin',
    isAdmin: (state) => state.user?.role === 'admin',
    isManager: (state) => state.user?.role === 'manager' || state.user?.role === 'admin',
    organizationId: (state) => state.user?.organization_id || null,
    branchId: (state) => state.user?.branch_id || null,
    isImpersonating: (state) => !!state.superAdminToken,
  },
  actions: {
    async login(username, password) {
      const { data } = await api.post('/auth/login', { username, password });
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    },
    logout() {
      this.token = null;
      this.user = null;
      this.superAdminToken = null;
      this.superAdminUser = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('super_admin_token');
      localStorage.removeItem('super_admin_user');
      resetOrgLabels();
    },
    async fetchMe() {
      const { data } = await api.get('/auth/me');
      this.user = data;
      localStorage.setItem('user', JSON.stringify(data));
    },
    async impersonate(orgId) {
      const { data } = await api.post(`/super-admin/${orgId}/impersonate`);
      this.superAdminToken = this.token;
      this.superAdminUser = this.user;
      localStorage.setItem('super_admin_token', this.token);
      localStorage.setItem('super_admin_user', JSON.stringify(this.user));
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      resetOrgLabels();
      return data;
    },
    restoreSuperAdmin() {
      if (!this.superAdminToken) return false;
      this.token = this.superAdminToken;
      this.user = this.superAdminUser;
      localStorage.setItem('token', this.superAdminToken);
      localStorage.setItem('user', JSON.stringify(this.superAdminUser));
      this.superAdminToken = null;
      this.superAdminUser = null;
      localStorage.removeItem('super_admin_token');
      localStorage.removeItem('super_admin_user');
      resetOrgLabels();
      return true;
    },
  },
});
