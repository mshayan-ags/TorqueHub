import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import swal from "sweetalert";
import { useNavigate } from "react-router-dom";
import { BackendLink } from "../../link";
import { withCartContext } from "../../context/Cart";
import { withAuthContext } from "../../context/Auth";
import { FaLock, FaCreditCard, FaShieldAlt } from "react-icons/fa";

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1A1A1A",
      fontFamily: '"Inter", sans-serif',
      "::placeholder": { color: "#9CA3AF" },
    },
    invalid: { color: "#dc2626" },
  },
};

function CheckoutForm({ Token, Cart, Address, Coupon, Notes, getTotalAfterCoupon, PlaceOrder, GuestInfo, EnsureGuestSession }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [Loading, setLoading] = useState(false);
  const [CardError, setCardError] = useState("");

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const isGuest = !(Token || localStorage.getItem("token"));
    if (!isGuest && !Address) {
      swal({
        text: "Please select a delivery address first",
        button: { text: "Ok", closeModal: true },
        icon: "warning",
      });
      return;
    }
    if (isGuest && !GuestInfo) {
      swal({
        text: "Please fill in your delivery details first",
        button: { text: "Ok", closeModal: true },
        icon: "warning",
      });
      return;
    }
    if (!Cart?.length) {
      swal({
        text: "Your cart is empty",
        button: { text: "Ok", closeModal: true },
        icon: "warning",
      });
      return;
    }

    setLoading(true);
    setCardError("");
    try {
      // Guests need a one-shot token/address before Stripe can even be
      // asked for a payment intent, since create-payment-intent requires an
      // authenticated user. This is cached in CartContext so the guest is
      // not re-registered between this call and the later Create-Sale call.
      let sessionToken = Token || localStorage.getItem("token");
      let sessionAddress = Address;
      if (isGuest) {
        const session = await EnsureGuestSession(GuestInfo);
        if (!session) {
          setCardError("Could not start guest checkout. Please check your details and try again.");
          setLoading(false);
          return;
        }
        sessionToken = session.token;
        sessionAddress = session.addressId;
      }

      const authHeader = { headers: { Authorization: sessionToken } };
      const amount = Math.round(Number(getTotalAfterCoupon() || 0) * 100);

      const { data: paymentIntent } = await axios.post(
        `${BackendLink}/create-payment-intent`,
        {
          amount,
          currency: "usd",
          orderPayload: {
            Product: Cart,
            Address: sessionAddress || null,
            Bank: null,
            Coupon: Coupon || null,
            paymentMethod: "Card",
            Notes,
            Total: getTotalAfterCoupon(),
          },
        },
        authHeader
      );

      const cardElement = elements.getElement(CardElement);
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (pmError) {
        setCardError(pmError.message);
        setLoading(false);
        return;
      }

      const { data: confirmData } = await axios.post(
        `${BackendLink}/confirm-payment-intent`,
        {
          intent: paymentIntent?.id,
          paymentMethod,
        },
        authHeader
      );

      const retrieved = await stripe.retrievePaymentIntent(confirmData?.clientSecret);
      const status = retrieved?.paymentIntent?.status;

      if (status === "requires_action") {
        const { error: actionError } = await stripe.confirmCardPayment(confirmData?.clientSecret);
        if (actionError) {
          setCardError(actionError.message);
          setLoading(false);
          return;
        }
      } else if (status && status !== "succeeded") {
        setCardError("Payment could not be completed. Please try again.");
        setLoading(false);
        return;
      }

      await PlaceOrder(navigate, confirmData?.bankId, "Card", GuestInfo);
    } catch (err) {
      setCardError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Payment failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handlePay}
      className="relative w-full bg-white border border-[#d2d2d7] rounded-2xl p-8 md:p-10"
    >
      <div className="flex items-center gap-3 mb-8">
        <FaCreditCard className="w-6 h-6 text-[#1d1d1f]" />
        <div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f]">Pay With Card</h2>
          <p className="text-sm text-[#6e6e73] flex items-center gap-1">
            <FaLock className="w-3 h-3" /> Secured by Stripe
          </p>
        </div>
      </div>

      <div className="border border-[#d2d2d7] focus-within:border-[#f97316] rounded-xl p-4 bg-white transition-colors duration-200">
        <CardElement options={cardElementOptions} />
      </div>

      {CardError && (
        <p className="text-red-500 text-sm mt-3">{CardError}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || Loading}
        className="mt-8 w-full py-4 rounded-full text-white font-medium text-lg bg-[#f97316] hover:bg-[#ea580c] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {Loading ? "Processing..." : `Pay $${Number(getTotalAfterCoupon() || 0).toFixed(2)}`}
      </button>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#86868b]">
        <FaShieldAlt className="w-4 h-4 text-[#f97316]" />
        Your payment information is encrypted and secure
      </div>
    </form>
  );
}

function Payment(props) {
  if (!stripePromise) {
    return (
      <div className="w-full bg-white/90 border-2 border-red-200 rounded-3xl shadow-xl p-8 text-center text-red-600">
        Payments are not configured. Please set REACT_APP_STRIPE_PUBLISHABLE_KEY.
      </div>
    );
  }
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}

export default withAuthContext(withCartContext(Payment));
