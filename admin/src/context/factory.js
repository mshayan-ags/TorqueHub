import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { withAuthContext } from "./Auth";

// Shared factory for the entity contexts (Address, Bank, Brand, Category,
// Coupon, Discount, Product, Sale, User, ...). All of these were previously
// hand-duplicated, byte-for-byte identical files that only differed in the
// entity name and the endpoint string. This factory reproduces that exact
// behavior (including each entity's own state/action naming convention)
// so every consumer can keep importing `withXContext`, `AllX`, `XError`,
// `GetAllX` by the exact same names as before.
//
// `name` controls the shape of the exposed value: `All${name}`, `${name}Error`,
// `GetAll${name}`.
// `endpoint` is the exact (possibly inconsistently-pluralized) backend route,
// e.g. "GetAllCategorys" / "GetAllAddresss" - preserved verbatim, not "fixed".
// `transform` is an optional function applied to the response data before
// it's stored (e.g. Sale reverses the array to show newest first).
export function createEntityContext({ name, endpoint, transform }) {
  const Context = createContext();

  const withContext = (Component) => (props) =>
    (
      <Context.Consumer>
        {(value) => <Component {...value} {...props} />}
      </Context.Consumer>
    );

  const Provider = ({ children, Token, CheckToken }) => {
    const [All, setAll] = useState([]);
    const [Error, setError] = useState(null);

    const GetAll = () => {
      const token = Token || localStorage.getItem("token");
      if (!token) return;
      axios
        .get(`${process.env.REACT_APP_PUBLIC_PATH}/${endpoint}`, {
          headers: {
            Authorization: `${token}`,
          },
        })
        .then((res) => {
          if (res?.data?.status == 200) {
            const data = res?.data?.data;
            setAll(transform ? transform(data) : data);
          } else {
            setError(res?.data?.message);
          }
        })
        .catch((err) => {
          setError(err?.message);
        });
    };

    // Dependent on [Token] (rather than a mount-only effect) so it fires
    // once Auth.js hydrates the token - this is what removes the need for
    // the old setTimeout(500) retry-poll every one of these files used to have.
    useEffect(() => {
      GetAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Token]);

    const value = {
      [`GetAll${name}`]: GetAll,
      [`All${name}`]: All,
      [`${name}Error`]: Error,
    };

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  return { Context, withContext, Provider: withAuthContext(Provider) };
}
