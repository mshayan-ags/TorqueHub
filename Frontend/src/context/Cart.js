import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { BackendLink } from "../link";
import { withAuthContext } from "./Auth";
import swal from "sweetalert";
import { useNavigate } from "react-router-dom";

export const CartContext = createContext();

export const withCartContext = (Component) => (props) =>
(
  <CartContext.Consumer>
    {(value) => <Component {...value} {...props} />}
  </CartContext.Consumer>
);

function uniqueByProductID(arr) {
  const uniqueMap = {};

  // Using reduce to iterate over the array and build a map of unique ProductID values
  const uniqueArr = arr.reduce((acc, obj) => {
    // Check if ProductID already exists in the map
    if (!uniqueMap[obj.ProductID]) {
      // If not, add it to the map and push the object to the accumulator array
      uniqueMap[obj.ProductID] = true;
      acc.push(obj);
    }
    return acc;
  }, []);

  return uniqueArr;
}

const CartProvider = ({ children, Token, CheckToken }) => {
  const [Cart, setCart] = useState([]);
  const [Address, setAddress] = useState("");
  const [Order, setOrder] = useState("");
  const [Notes, setNotes] = useState("");
  const [Coupon, setCoupon] = useState("");
  const [ScheduleOrder, setScheduleOrder] = useState(null);
  const [AllCoupon, setAllCoupon] = useState([]);
  const [CouponError, setCouponError] = useState("")
  const [UsedCoupon, setUsedCoupon] = useState([]);
  // Phase F7: guest checkout details, held only in memory for the current
  // session — never written to localStorage.
  const [GuestInfo, setGuestInfo] = useState(null);

  function CheckCart() {
    const storedCart = JSON.parse(localStorage.getItem("Cart"));
    if (Array.isArray(storedCart) && storedCart.length > 0) {
      setCart(storedCart);
    } else {
      localStorage.setItem("Cart", JSON.stringify([]));
      setCart([]);
    }
  }


  function AddToCart({ id, quantity, price, discountedPrice, DiscountID }) {
    CheckCart()
    const Arr = [...Cart];
    const Obj = { "ProductID": id, "quantity": quantity || 1, "price": price, discountedPrice: discountedPrice > 0 ? discountedPrice : 0, DiscountID: DiscountID || null }
    Arr.push(Obj)
    const uniqueArray = uniqueByProductID(Arr);
    setCart(uniqueArray)
    localStorage.setItem("Cart", JSON.stringify(uniqueArray));
  }


  function UpdateItemCart(id, quantity) {
    CheckCart()
    const updatedCart = Cart.map(item => {
      if (item.ProductID === id) {
        return { ...item, quantity: quantity || 1 };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem("Cart", JSON.stringify(updatedCart));
    console.log(updatedCart, Cart, "Cart")
  }

  function RemoveItemCart(id) {
    CheckCart()
    const updatedCart = Cart.filter(item => item.ProductID !== id);
    setCart(updatedCart);
    localStorage.setItem("Cart", JSON.stringify(updatedCart));
  }


  function isItemCart(id) {
    const Arr = [...Cart];
    return Arr.some((a) => a?.ProductID === id);
  }

  function getItemCart(id) {
    const Arr = [...Cart];
    const Obj = Arr.filter((a) => {
      if (a?.ProductID === id) {
        return a
      }
    });
    if (Obj?.length > 0 && Obj[0]?.ProductID == id)
      return Obj[0];
  }

  function getSubTotal() {
    let Total = 0;
    Cart?.forEach((a) => {
      Total += (a?.price * a?.quantity)
    })
    return Total?.toFixed(2)
  }

  function getTotal() {
    let Total = 0;
    Cart?.forEach((a) => {
      let price = a?.DiscountID ? a?.discountedPrice : a?.price;
      Total += (price * a?.quantity)
    })
    return Number(Total?.toFixed(2)) || 0
  }

  function getDiscount() {
    return Number(getSubTotal() - getTotal())?.toFixed(2) ||  0
  }


  function getCouponDiscount() {
    if (UsedCoupon?._id) {
      const value = UsedCoupon?.discountType == "Percentage" ? (getTotal() / 100 * UsedCoupon?.discountValue) : UsedCoupon?.discountValue
      return Number(value?.toFixed(2)) || 0
    }
    return 0
  }

  function getTotalAfterCoupon() {
    return Number(getTotal() - (Number(getCouponDiscount()) || 0) ) || 0
  }


  useEffect(() => {
    if (localStorage.getItem("Cart")) setCart(localStorage.getItem("Cart"));
    if (localStorage.getItem("Coupon")) setCoupon(localStorage.getItem("Coupon"));
  }, []);

  // Phase F2: getTotal() must stay a pure computation; clearing the coupon
  // when the cart empties out is a side effect that belongs here instead.
  useEffect(() => {
    if (getTotal() <= 0 && Coupon) {
      setCoupon("");
      localStorage?.removeItem("Coupon");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Cart]);


  // Phase F7: guest checkout support. GuestSession is held only in memory
  // (component state, never localStorage) for the lifetime of one checkout —
  // it is cleared as soon as the order is placed (or the tab is closed).
  const [GuestSession, setGuestSession] = useState(null);

  // Exchanges guestInfo for a one-shot token via /Guest-Checkout, then uses
  // that token to create the guest's Address. Caches the result in
  // GuestSession so create-payment-intent, confirm-payment-intent and
  // Create-Sale can all reuse the same guest identity without re-registering.
  const EnsureGuestSession = async (guestInfo) => {
    if (Token || localStorage.getItem("token")) return null;
    if (GuestSession?.token && GuestSession?.addressId) return GuestSession;
    if (!guestInfo) return null;

    const guestRes = await axios.post(`${BackendLink}/Guest-Checkout`, {
      name: guestInfo?.name,
      email: guestInfo?.email,
      phoneNumber: guestInfo?.phone_number,
      address_line1: guestInfo?.address_line1,
      address_line2: guestInfo?.address_line2,
      city: guestInfo?.city,
      state: guestInfo?.state,
      postal_code: guestInfo?.postal_code,
      country: guestInfo?.country,
    }).catch((err) => {
      swal({
        text: err?.response?.data?.message || "Could not start guest checkout",
        button: { text: "Ok", closeModal: true },
        icon: "error",
      });
      return null;
    });

    if (!guestRes || guestRes?.data?.status != 200 || !guestRes?.data?.token) {
      return null;
    }

    // Held only in memory for the rest of this checkout — deliberately not
    // written to localStorage as a real session.
    const token = guestRes.data.token;

    const addressRes = await axios.post(
      `${BackendLink}/Create-Address`,
      {
        full_name: guestInfo?.name,
        phone_number: guestInfo?.phone_number,
        address_line1: guestInfo?.address_line1,
        address_line2: guestInfo?.address_line2,
        city: guestInfo?.city,
        state: guestInfo?.state,
        postal_code: guestInfo?.postal_code,
        country: guestInfo?.country,
      },
      { headers: { Authorization: token } }
    ).catch(() => null);

    const addressId = addressRes?.data?.data?._id;
    if (!addressId) {
      swal({
        text: "Could not save your delivery address. Please try again.",
        button: { text: "Ok", closeModal: true },
        icon: "error",
      });
      return null;
    }

    const session = { token, addressId };
    setGuestSession(session);
    return session;
  };

  const PlaceOrder = async (navigate, bank, paymentMethod, guestInfo) => {
    try {
      let authToken = Token || localStorage.getItem("token");
      let addressId = Address;

      if (!authToken) {
        const session = await EnsureGuestSession(guestInfo);
        if (!session) {
          return;
        }
        authToken = session.token;
        addressId = session.addressId;
      }

      if (!authToken || !addressId) {
        return;
      }

      const Obj = {
        "Product": Cart,
        "Bank": bank,
        "Address": addressId,
        "paymentMethod": paymentMethod,
        Notes: Notes,
        Total: getTotal(),
      }

      if (new Date(ScheduleOrder) > new Date()) {
        Obj.scheduleDate = ScheduleOrder;
        Obj.status = "Scheduled"
      }
      await axios.post(`${BackendLink}/Create-Sale`, Obj, {
        headers: {
          Authorization: authToken,
        },
      }).then((res) => {
        if (res?.data?.status == 200) {
          setOrder(res?.data?.id);
          localStorage.removeItem("Cart");
          localStorage.removeItem("Coupon");
          setCart([])
          setAddress("")
          setCoupon("")
          setScheduleOrder(null)
          setGuestInfo(null)
          setGuestSession(null)
          swal({
            text: "Order Placed Thanks For Ordering",
            button: {
              text: "Ok",
              closeModal: true
            },
            icon: res?.data?.status == 200 ? "success" : "error",
            time: 3000
          });
          navigate(`/OrderTracking/${res?.data?.id}`);
        }
      }).catch((err) => {
        swal({
          text: err?.response?.data?.message
            ? err?.response?.data?.message
            : "There was some Error",
          button: {
            text: "Ok",
            closeModal: true
          },
          icon: "error",
          time: 3000
        });
      });
    } catch (error) {
      console.log('Error creating payment intent:', error);
    }
  };


  const ReedeemCoupon = async (code) => {
    try {
      if (Token) {
        await axios.post(`${BackendLink}/Reedem-Coupon`, {
          "Coupon": code,
          "total": getTotal(),
        }, {
          headers: {
            Authorization: Token
              ? `${Token}`
              : `${localStorage.getItem("token")}`,
          },
        }).then((res) => {
          if (res?.data?.status == 200) {
            setCoupon(res?.data?.data?._id);
            localStorage.setItem("Coupon", res?.data?.data?._id);

            swal({
              text: res?.data?.message,
              button: {
                text: "Ok",
                closeModal: true
              },
              icon: res?.data?.status == 200 ? "success" : "error",
              time: 3000
            });
          }
        }).catch((err) => {
          swal({
            text: err?.response?.data?.message
              ? err?.response?.data?.message
              : "There was some Error",
            button: {
              text: "Ok",
              closeModal: true
            },
            icon: "error",
            time: 3000
          });
        });
      } else {
        swal({
          text: "Please Login To Reedeem Coupons and Discounts",
          button: {
            text: "Ok",
            closeModal: true
          },
          icon: "warning",
          time: 3000
        });
      }
    } catch (error) {
      console.log('Error creating payment intent:', error);
    }
  };


  // Converts loyalty points into a real, single-use Coupon server-side, then
  // applies it through the exact same ReedeemCoupon flow used for any other
  // coupon code — no separate "points discount" code path to maintain.
  const RedeemPoints = async (points) => {
    if (!Token) {
      swal({
        text: "Please Login To Redeem Points",
        button: { text: "Ok", closeModal: true },
        icon: "warning",
        time: 3000
      });
      return;
    }
    try {
      const res = await axios.post(`${BackendLink}/Redeem-Points`, { points }, {
        headers: {
          Authorization: Token
            ? `${Token}`
            : `${localStorage.getItem("token")}`,
        },
      });
      if (res?.data?.status == 200 && res?.data?.data?.code) {
        await ReedeemCoupon(res?.data?.data?.code);
      }
      swal({
        text: res?.data?.message,
        button: { text: "Ok", closeModal: true },
        icon: res?.data?.status == 200 ? "success" : "error",
        time: 3000
      });
    } catch (err) {
      swal({
        text: err?.response?.data?.message
          ? err?.response?.data?.message
          : "There was some Error",
        button: { text: "Ok", closeModal: true },
        icon: "error",
        time: 3000
      });
    }
  };

  const GetAllCouponsUser = () => {
    axios
      .get(`${BackendLink}/GetAllCouponsUser`, {
        headers: {
          Authorization: Token
            ? `${Token}`
            : `${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res?.data?.status == 200) {
          setAllCoupon(res?.data?.data?.reverse());
        } else {
          setCouponError(res?.data?.message);
        }
      })
      .catch((err) => {
        setCouponError(err?.message);
      });
  };

  const GetUsedCouponsUser = () => {
    if (Token) {
      axios
        .get(`${BackendLink}/CouponInfo/${Coupon}`, {
          headers: {
            Authorization: Token
              ? `${Token}`
              : `${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          if (res?.data?.status == 200) {
            setUsedCoupon(res?.data?.data);
          } else {
            setCouponError(res?.data?.message);
          }
        })
        .catch((err) => {
          setCouponError(err?.message);
        });
    }
  };

  useEffect(() => {
    CheckCart();
    CheckToken()
    GetAllCouponsUser()
    GetUsedCouponsUser()
  }, []);
  return (
    <CartContext.Provider
      value={{
        Cart,
        setCart,
        CheckCart,
        AddToCart,
        UpdateItemCart,
        RemoveItemCart,
        isItemCart,
        getItemCart,
        getTotal,
        PlaceOrder,
        Address,
        setAddress,
        Notes,
        setNotes,
        getSubTotal,
        getDiscount,
        Order, setOrder,
        Coupon, setCoupon,
        ReedeemCoupon,
        RedeemPoints,
        AllCoupon, CouponError, GetAllCouponsUser,
        getCouponDiscount,
        GetUsedCouponsUser,
        UsedCoupon,
        getTotalAfterCoupon,
        ScheduleOrder,
        setScheduleOrder,
        GuestInfo,
        setGuestInfo,
        GuestSession,
        EnsureGuestSession
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default withAuthContext(CartProvider);
