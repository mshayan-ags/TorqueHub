import React, { Suspense, lazy, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Aos from "aos";

import RequireAuth from "./Components/RequireAuth";

// Phase F8: route-level code splitting — every page below is loaded on
// demand instead of eagerly bundled into the main chunk.
const Home = lazy(() => import("./Pages/Home"));
const Cart = lazy(() => import("./Pages/Cart"));
const Category = lazy(() => import("./Pages/Category"));
const Checkout = lazy(() => import("./Pages/Checkout"));
const ProductDetails = lazy(() => import("./Pages/ProductDetails"));
const Wishlist = lazy(() => import("./Pages/Wishlist"));
const OrderTracking = lazy(() => import("./Pages/OrderTracking"));
const TrackOrder = lazy(() => import("./Pages/TrackOrder"));
const Compare = lazy(() => import("./Pages/Compare"));
const SignIn = lazy(() => import("./Pages/Singin"));
const SignUp = lazy(() => import("./Pages/Signup"));
const Payment = lazy(() => import("./Pages/Payment"));
const AccountSetting = lazy(() => import("./Pages/AccountSetting"));
const OrderHistory = lazy(() => import("./Pages/OrderHistory"));
const Privacy = lazy(() => import("./Pages/Privacy"));
const TermsOfUse = lazy(() => import("./Pages/TAC"));
const Profile = lazy(() => import("./Pages/Profile"));
const About = lazy(() => import("./Pages/About"));
const ChangePasswordMain = lazy(() => import("./Pages/ChangePassword"));
const Blog = lazy(() => import("./Pages/Blog"));
const BlogDetail = lazy(() => import("./Pages/BlogDetail"));

function PageLoader() {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#f97316]/30 border-t-[#f97316] rounded-full animate-spin"></div>
    </div>
  );
}

const App = () => {
  useEffect(() => {
    Aos.init(
      {
        once: true,
      }
    );
  }, [])
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/AccountSetting",
      // any authenticated user
      element: (
        <RequireAuth>
          <AccountSetting />
        </RequireAuth>
      ),
    },
    {
      path: "/ChangePassword",
      element: <ChangePasswordMain />,
    },
    {
      path: "/privacy-policy",
      element: <Privacy />,
    },
    {
      path: "/TermsOfUse",
      element: <TermsOfUse />,
    },
    {
      path: "/About",
      element: <About />,
    },
    {
      path: "/Blog",
      element: <Blog />,
    },
    {
      path: "/Blog/:id",
      element: <BlogDetail />,
    },
    {
      path: "/Profile",
      element: (
        <RequireAuth>
          <Profile />
        </RequireAuth>
      ),
    },
    {
      path: "/OrderHistory",
      element: (
        <RequireAuth>
          <OrderHistory />
        </RequireAuth>
      ),
    },
    {
      path: "/Cart",
      element: <Cart />,
    },
    {
      // Guest checkout allowed: no RequireAuth wrapper (Phase F7)
      path: "/Payment",
      element: <Payment />,
    },
    {
      path: "/OrderTracking/:id",
      element: <OrderTracking />,
    },
    {
      path: "/Track-Order",
      element: <TrackOrder />,
    },
    {
      path: "/Compare",
      element: <Compare />,
    },
    {
      path: "/SignIn",
      element: <SignIn />,
    },
    {
      path: "/SignUp",
      element: <SignUp />,
    },
    {
      path: "/Category",
      element: <Category />,
    },
    {
      path: "/Category/:name",
      element: <Category />,
    },
    {
      // Guest checkout allowed: no RequireAuth wrapper (Phase F7)
      path: "/Checkout",
      element: <Checkout />,
    },
    {
      path: "/ProductDetails/:id",
      element: <ProductDetails />,
    },
    {
      path: "/Wishlist",
      element: (
        <RequireAuth>
          <Wishlist />
        </RequireAuth>
      ),
    },
    {
      path: "*",
      element: <Home />,
    },
  ]);
  return (
    <Suspense fallback={<PageLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default App;
