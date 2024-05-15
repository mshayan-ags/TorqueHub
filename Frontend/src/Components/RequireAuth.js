import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { withAuthContext } from "../context/Auth";

function RequireAuth({ Token, children }) {
  const location = useLocation();
  const isLoggedIn = !!(Token || localStorage.getItem("token"));

  if (!isLoggedIn) {
    return <Navigate to="/SignIn" state={{ from: location }} replace />;
  }

  return children;
}

export default withAuthContext(RequireAuth);
