export const STAFF_ROLES = ['admin', 'staff', 'inventory_manager'];

export const getHomeForRole = (role) => {
  const paths = {
    admin: '/admin/dashboard',
    staff: '/staff/dashboard',
    inventory_manager: '/inventory/dashboard',
  };
  return paths[role] || '/';
};

export const getDashboardLabel = (role) => {
  const labels = {
    admin: 'Admin Dashboard',
    staff: 'Staff Dashboard',
    inventory_manager: 'Inventory Dashboard',
  };
  return labels[role];
};
