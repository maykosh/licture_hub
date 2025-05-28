import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/entities/auth";
import { JSX } from "react";
import { Role } from "@/shared/types/types";

interface ProtectedRouteProps {
   children: JSX.Element;
   requiredRole?: Role;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
   children,
   requiredRole,
}) => {
   const user = useAuthStore((state) => state.user);
   console.log(user);
   if (!user) {
      return <Navigate to="/login" replace />;
   }

   if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/login" replace />;
   }

   return children;
};
