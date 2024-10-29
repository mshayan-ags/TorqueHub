import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "./index.css"
import AuthProvider from "./context/Auth";
import ProductProvider from "./context/Product";
import CartProvider from "./context/Cart";
import WishlistProvider from "./context/Wishlist";
import CompareProvider from "./context/Compare";
import VehicleProvider from "./context/Vehicle";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./msalConfig";

const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <ProductProvider>
          <WishlistProvider>
            <CompareProvider>
              <VehicleProvider>
                <MsalProvider instance={msalInstance}>
                  <App />
                </MsalProvider>
              </VehicleProvider>
            </CompareProvider>
          </WishlistProvider>
        </ProductProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);


reportWebVitals();
