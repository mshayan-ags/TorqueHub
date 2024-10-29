import React, { createContext, useEffect, useState } from "react";

export const VehicleContext = createContext();

export const withVehicleContext = (Component) => (props) =>
(
  <VehicleContext.Consumer>
    {(value) => <Component {...value} {...props} />}
  </VehicleContext.Consumer>
);

const STORAGE_KEY = "selectedVehicle";

function readStoredVehicle() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

// Pure frontend, localStorage-backed — no account required to remember a
// shopper's vehicle, same reasoning as Compare.
const VehicleProvider = ({ children }) => {
  const [Vehicle, setVehicleState] = useState(readStoredVehicle);

  useEffect(() => {
    if (Vehicle) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Vehicle));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [Vehicle]);

  const setVehicle = (vehicle) => setVehicleState(vehicle);
  const clearVehicle = () => setVehicleState(null);

  const productFitsVehicle = (product) => {
    if (!Vehicle || !product?.fitment?.length) return false;
    return product.fitment.some(
      (f) =>
        f?.make === Vehicle.make &&
        f?.model === Vehicle.model &&
        Number(Vehicle.year) >= Number(f?.yearStart) &&
        Number(Vehicle.year) <= Number(f?.yearEnd)
    );
  };

  return (
    <VehicleContext.Provider value={{ Vehicle, setVehicle, clearVehicle, productFitsVehicle }}>
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleProvider;
