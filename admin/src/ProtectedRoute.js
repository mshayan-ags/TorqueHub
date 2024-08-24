import { Navigate } from "react-router-dom";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";

const routes = (isLoggedIn) => {
  return [
    {
      path: "auth/*",
      element: !isLoggedIn ? <AuthLayout /> : <Navigate to="/admin/default" />,
    },
    {
      path: "admin/*",
      element: isLoggedIn ? <AdminLayout /> : <Navigate to="/auth/sign-in" />,
    },
    {
      path: "*",
      element: isLoggedIn ? <AdminLayout /> : <Navigate to="/auth/sign-in" />,
    },
  ];
};

export default routes;
