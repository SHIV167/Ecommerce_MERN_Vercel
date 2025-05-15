// These functions are no longer used as we rely on server-set cookies for authentication

export const saveAdminToken = (token: string) => {
  // Deprecated: localStorage.setItem('adminToken', token);
};

export const getAdminToken = (): string | null => {
  // Deprecated
  return null;
};

export const removeAdminToken = () => {
  // Deprecated: localStorage.removeItem('adminToken');
};

export const isAdminAuthenticated = (): boolean => {
  // This will be checked via API call to verify endpoint
  return false;
};
