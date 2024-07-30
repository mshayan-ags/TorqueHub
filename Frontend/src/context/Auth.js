import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { BackendLink } from "../link";

export const AuthContext = createContext();

export const withAuthContext = (Component) => (props) =>
(
  <AuthContext.Consumer>
    {(value) => <Component {...value} {...props} />}
  </AuthContext.Consumer>
);

const AuthProvider = ({ children }) => {
  const [Token, setToken] = useState("");
  const [currUser, setcurrUser] = useState({});
  const [MenuOpen, setMenuOpen] = useState(false);
  const GetCurrentUser = () => {
    if (Token || localStorage.getItem("token")) {
      axios
        .get(`${BackendLink}/UserInfo`, {
          headers: {
            Authorization: Token
              ? `${Token}`
              : `${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          if (res?.data?.status == 200) {
            setcurrUser(res?.data?.data);
          }
        })
        .catch((err) => {
          console.log(err?.message);
        });
    }
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
    if (localStorage.getItem("token")) setToken(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    CheckToken();
    GetCurrentUser();
  }, [Token]);

  useEffect(() => {
    CheckToken();
    GetCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        Token,
        setToken,
        CheckToken,
        currUser,
        GetCurrentUser,
        MenuOpen, setMenuOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
