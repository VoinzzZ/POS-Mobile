import { useAuth } from "../context/AuthContext";

export type UserRole = "ADMIN" | "CASHIER";

export const useRoleAccess = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const isCashier = user?.role === "CASHIER";

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role as UserRole);
    }
    
    return user.role === role;
  };

  const can = {
    // Admin permissions
    manageUsers: isAdmin,
    viewReports: isAdmin,
    manageProducts: isAdmin,
    manageCategories: isAdmin,
    viewAllTransactions: isAdmin,
    
    // Cashier permissions
    createTransaction: isCashier || isAdmin,
    viewOwnTransactions: isCashier || isAdmin,
    
    // Shared permissions
    viewProducts: true,
    viewCategories: true,
  };

  return {
    user,
    isAdmin,
    isCashier,
    hasRole,
    can,
  };
};

export default useRoleAccess;
