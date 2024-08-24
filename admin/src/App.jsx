import { useRoutes } from "react-router-dom";
import { withAuthContext } from "context/Auth";
import getRoutes from "./ProtectedRoute";

function App({ Token }) {
  const isLoggedIn = !!(Token || localStorage.getItem("token"));
  return useRoutes(getRoutes(isLoggedIn));
}

export default withAuthContext(App);
