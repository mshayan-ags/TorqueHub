import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { BackendLink } from "../link";
import { withAuthContext } from "./Auth";

export const WishlistContext = createContext();

export const withWishlistContext = (Component) => (props) =>
(
  <WishlistContext.Consumer>
    {(value) => <Component {...value} {...props} />}
  </WishlistContext.Consumer>
);

const WishlistProvider = ({ children, Token }) => {
  const [Wishlist, setWishlist] = useState([]);
  const [WishlistError, setWishlistError] = useState(null);

  const authHeader = () => ({
    headers: {
      Authorization: Token ? `${Token}` : `${localStorage.getItem("token")}`,
    },
  });

  const GetWishlist = () => {
    if (!(Token || localStorage.getItem("token"))) return;
    axios
      .get(`${BackendLink}/GetWishlist`, authHeader())
      .then((res) => {
        if (res?.data?.status == 200) {
          setWishlist(res?.data?.data || []);
        } else {
          setWishlistError(res?.data?.message);
        }
      })
      .catch((err) => {
        setWishlistError(err?.message);
      });
  };

  const isWishlisted = (productId) => {
    return Wishlist?.some(
      (w) => (w?._id || w) === productId
    );
  };

  const AddToWishlist = (productId) => {
    if (!(Token || localStorage.getItem("token"))) return;
    axios
      .post(`${BackendLink}/Add-To-Wishlist`, { product: productId }, authHeader())
      .then((res) => {
        if (res?.data?.status == 200) {
          GetWishlist();
        }
      })
      .catch((err) => {
        setWishlistError(err?.message);
      });
  };

  const RemoveFromWishlist = (productId) => {
    if (!(Token || localStorage.getItem("token"))) return;
    axios
      .post(`${BackendLink}/Remove-From-Wishlist`, { product: productId }, authHeader())
      .then((res) => {
        if (res?.data?.status == 200) {
          GetWishlist();
        }
      })
      .catch((err) => {
        setWishlistError(err?.message);
      });
  };

  const ToggleWishlist = (productId) => {
    if (!(Token || localStorage.getItem("token"))) return;
    if (isWishlisted(productId)) {
      RemoveFromWishlist(productId);
    } else {
      AddToWishlist(productId);
    }
  };

  useEffect(() => {
    GetWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Token]);

  return (
    <WishlistContext.Provider
      value={{
        Wishlist,
        WishlistError,
        GetWishlist,
        isWishlisted,
        AddToWishlist,
        RemoveFromWishlist,
        ToggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export default withAuthContext(WishlistProvider);
