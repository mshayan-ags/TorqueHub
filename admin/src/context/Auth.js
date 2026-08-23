import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const withAuthContext = (Component) => (props) =>
  (
    <AuthContext.Consumer>
      {(value) => <Component {...value} {...props} />}
    </AuthContext.Consumer>
  );

const AuthProvider = ({ children }) => {
  const [Token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [currAdmin, setcurrAdmin] = useState({});
  const [AdminRole, setAdminRole] = useState("");

  const GetCurrentAdmin = () => {
    const token = Token || localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${process.env.REACT_APP_PUBLIC_PATH}/AdminInfo`, {
        headers: {
          Authorization: `${token}`,
        },
      })
      .then((res) => {
        if (res?.data?.status == 200) {
          setcurrAdmin(res?.data?.data);
          setAdminRole(res?.data?.data?.Role);
        }
      })
      .catch((err) => {
        console.log(err?.message);
        // An expired/invalid token: clear it so RequireAuth/Sidebar stop
        // treating this session as logged in instead of silently keeping
        // a token the backend will keep rejecting.
        if (err?.response?.status === 401) {
          localStorage.removeItem("token");
          setToken("");
        }
      });
  };

  function CheckToken() {
    if ((!Token || Token == "") && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
    } else if (
      !localStorage.getItem("token") ||
      localStorage.getItem("token") == ""
    ) {
      localStorage.removeItem("token");
      setToken("");
    }
  }

  useEffect(() => {
    CheckToken();
    GetCurrentAdmin();
  }, [Token]);

  return (
    <AuthContext.Provider
      value={{
        Token,
        setToken,
        CheckToken,
        currAdmin,
        GetCurrentAdmin,
        AdminRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
