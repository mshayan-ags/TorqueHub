/* eslint-disable */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import DashIcon from "components/icons/DashIcon";
import { withProductContext } from "context/Product";
// chakra imports

// Non-archived products at or below this remaining quantity show a badge
// on the Product nav item. quantity is stored as a String on the model, so
// it's cast with Number(...) before comparing.
const LOW_STOCK_THRESHOLD = 5;

export function SidebarLinks(props) {
  // Chakra color mode
  let location = useLocation();

  const { routes, AllProduct } = props;

  const lowStockCount = (AllProduct || []).filter(
    (p) => !p?.isArchive && Number(p?.quantity) <= LOW_STOCK_THRESHOLD
  ).length;

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (
        (route.layout === "/admin" ||
          route.layout === "/auth" ||
          route.layout === "/rtl")
        && !route?.isHidden
      ) {
        return (
          <Link key={index} to={route.layout + "/" + route.path}>
            <div className="relative mb-3 flex hover:cursor-pointer">
              <li
                className="my-[3px] flex cursor-pointer items-center px-8"
                key={index}
              >
                <span
                  className={`${activeRoute(route.path) === true
                      ? "font-bold text-brand-500 dark:text-white"
                      : "font-medium text-gray-600"
                    }`}
                >
                  {route.icon ? route.icon : <DashIcon />}{" "}
                </span>
                <p
                  className={`leading-1 ml-4 flex ${activeRoute(route.path) === true
                      ? "font-bold text-navy-700 dark:text-white"
                      : "font-medium text-gray-600"
                    }`}
                >
                  {route.name}
                </p>
                {route.path === "Product" && lowStockCount > 0 && (
                  <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {lowStockCount}
                  </span>
                )}
              </li>
              {activeRoute(route.path) ? (
                <div class="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
              ) : null}
            </div>
          </Link>
        );
      }
    });
  };
  // BRAND
  return createLinks(routes);
}

export default withProductContext(SidebarLinks);
