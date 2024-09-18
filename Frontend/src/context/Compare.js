import React, { createContext, useEffect, useState } from "react";

export const CompareContext = createContext();

export const withCompareContext = (Component) => (props) =>
(
  <CompareContext.Consumer>
    {(value) => <Component {...value} {...props} />}
  </CompareContext.Consumer>
);

const STORAGE_KEY = "compareProductIds";
const MAX_COMPARE = 4;

function readStoredIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

// Pure frontend, localStorage-backed — comparison is a lightweight,
// no-account-required feature, unlike Wishlist which is server/DB backed.
const CompareProvider = ({ children }) => {
  const [Compare, setCompare] = useState(readStoredIds);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Compare));
  }, [Compare]);

  const isCompared = (productId) => Compare.includes(productId);

  const AddToCompare = (productId) => {
    setCompare((prev) => {
      if (prev.includes(productId)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, productId];
    });
  };

  const RemoveFromCompare = (productId) => {
    setCompare((prev) => prev.filter((id) => id !== productId));
  };

  const ToggleCompare = (productId) => {
    if (isCompared(productId)) {
      RemoveFromCompare(productId);
    } else {
      AddToCompare(productId);
    }
  };

  const ClearCompare = () => setCompare([]);

  return (
    <CompareContext.Provider
      value={{
        Compare,
        isCompared,
        AddToCompare,
        RemoveFromCompare,
        ToggleCompare,
        ClearCompare,
        MaxCompare: MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export default CompareProvider;
