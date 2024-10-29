import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";

// Icon Imports
import {
  MdHome,
  MdOutlineShoppingCart,
  MdBarChart,
  MdPerson,
  MdLock,
  MdSettings,
  MdRateReview,
  MdArticle,
  MdHistory,
  MdAssignmentReturn,
} from "react-icons/md";

import Address from "views/admin/Address/List";
import Bank from "views/admin/Bank/List";
import User from "views/admin/User/List";
import Sale from "views/admin/Sale/List";
import EditSale from "views/admin/Sale/OrderTracking";
import Brand from "views/admin/Brand/List";
import AddBrand from "views/admin/Brand/index";
import Category from "views/admin/Category/List";
import AddCategory from "views/admin/Category";

import Discount from "views/admin/Discount/List";
import AddDiscount from "views/admin/Discount/index";

import Coupon from "views/admin/Coupon/List";
import AddCoupon from "views/admin/Coupon";

import Product from "views/admin/Product/List";
import AddProduct from "views/admin/Product";
import SignIn from "views/auth/SignIn";
import Select from "views/admin/Product/Select";

import Blog from "views/admin/Blog/List";
import AddBlog from "views/admin/Blog/index";
import Review from "views/admin/Review/List";
import AuditLog from "views/admin/AuditLog/List";
import ReturnRequest from "views/admin/ReturnRequest/List";
import Settings from "views/admin/Settings/index";

const routes = [
  {
    name: "Sign In",
    layout: "/auth",
    path: "sign-in",
    component: <SignIn />,
    isHidden: true,
  },
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "Brand",
    layout: "/admin",
    path: "Brand",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Brand />,
  },
  {
    name: "AddBrand",
    layout: "/admin",
    isHidden: true,
    path: "AddBrand/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <AddBrand />,
  },
  {
    name: "Discount",
    layout: "/admin",
    path: "Discount",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Discount />,
  },
  {
    name: "AddDiscount",
    layout: "/admin",
    isHidden: true,
    path: "AddDiscount/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <AddDiscount />,
  },
  {
    name: "Category",
    layout: "/admin",
    path: "Category",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Category />,
  },
  {
    name: "AddCategory",
    layout: "/admin",
    isHidden: true,
    path: "AddCategory/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <AddCategory />,
  },
  {
    name: "Coupon",
    layout: "/admin",
    path: "Coupon",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Coupon />,
  },
  {
    name: "AddCoupon",
    layout: "/admin",
    isHidden: true,
    path: "AddCoupon/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <AddCoupon />,
  },
  {
    name: "Product",
    layout: "/admin",
    path: "Product",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Product />,
  },
  {
    name: "AddProduct",
    layout: "/admin",
    isHidden: true,
    path: "AddProduct/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <AddProduct />,
  },
  {
    name: "SelectProduct",
    layout: "/admin",
    isHidden: true,
    path: "SelectProduct/:ProductCode/:Type/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Select />,
  },
  {
    name: "Address",
    layout: "/admin",
    path: "Address",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Address />,
  },
  {
    name: "User",
    layout: "/admin",
    path: "User",
    icon: <MdPerson className="h-6 w-6" />,
    component: <User />,
  },
  {
    name: "Sale",
    layout: "/admin",
    path: "Sale",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Sale />,
  },
  {
    name: "EditSale",
    layout: "/admin",
    isHidden: true,
    path: "EditSale/:id",
    icon: <MdPerson className="h-6 w-6" />,
    component: <EditSale />,
  },
  {
    name: "Bank",
    layout: "/admin",
    path: "Bank",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Bank />,
  },
  {
    name: "Blog",
    layout: "/admin",
    path: "Blog",
    icon: <MdArticle className="h-6 w-6" />,
    component: <Blog />,
  },
  {
    name: "AddBlog",
    layout: "/admin",
    isHidden: true,
    path: "AddBlog/:id",
    icon: <MdArticle className="h-6 w-6" />,
    component: <AddBlog />,
  },
  {
    name: "Review",
    layout: "/admin",
    path: "Review",
    icon: <MdRateReview className="h-6 w-6" />,
    component: <Review />,
  },
  {
    name: "Return Requests",
    layout: "/admin",
    path: "ReturnRequest",
    icon: <MdAssignmentReturn className="h-6 w-6" />,
    component: <ReturnRequest />,
  },
  {
    name: "Audit Log",
    layout: "/admin",
    path: "AuditLog",
    icon: <MdHistory className="h-6 w-6" />,
    component: <AuditLog />,
  },
  {
    name: "Settings",
    layout: "/admin",
    path: "Settings",
    icon: <MdSettings className="h-6 w-6" />,
    component: <Settings />,
  },
];
export default routes;
