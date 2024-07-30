import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { withAuthContext } from "./Auth";
import { BackendLink } from "../link";

export const ProductContext = createContext();

export const withProductContext = (Component) => (props) =>
(
  <ProductContext.Consumer>
    {(value) => <Component {...value} {...props} />}
  </ProductContext.Consumer>
);

const ProductProvider = ({ children, Token, CheckToken }) => {
  const [AllProduct, setAllProduct] = useState([]);
  const [ProductError, setProductError] = useState(null);

  const [AllCategories, setAllCategories] = useState([]);
  const [CategoriesError, setCategoriesError] = useState(null);

  const [AllBrand, setAllBrand] = useState([]);
  const [BrandError, setBrandError] = useState(null);

  const [AllAddress, setAllAddress] = useState([]);
  const [AddressError, setAddressError] = useState(null);


  const [AllOrders, setAllOrders] = useState([]);
  const [OrdersError, setOrdersError] = useState(null);

  const GetAllProduct = () => {
    axios
      .get(`${BackendLink}/GetAllProductsUser`)
      .then((res) => {
        if (res?.data?.status == 200) {
          setAllProduct(res?.data?.data);
        } else {
          setProductError(res?.data?.message);
        }
      })
      .catch((err) => {
        setProductError(err?.message);
      });
  };
  const GetAllCategories = () => {
    axios
      .get(`${BackendLink}/GetAllCategorys`)
      .then((res) => {
        if (res?.data?.status == 200) {
          setAllCategories(res?.data?.data);
        } else {
          setCategoriesError(res?.data?.message);
        }
      })
      .catch((err) => {
        setCategoriesError(err?.message);
      });
  };
  const GetAllBrand = () => {
    axios
      .get(`${BackendLink}/GetAllBrands`)
      .then((res) => {
        if (res?.data?.status == 200) {
          setAllBrand(res?.data?.data);
        } else {
          setBrandError(res?.data?.message);
        }
      })
      .catch((err) => {
        setBrandError(err?.message);
      });
  };
  const GetAllAddress = () => {
    axios
      .get(`${BackendLink}/GetAllAddressUser`, {
        headers: {
          Authorization: Token
            ? `${Token}`
            : `${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res?.data?.status == 200) {
          setAllAddress(res?.data?.data);
        } else {
          setAddressError(res?.data?.message);
        }
      })
      .catch((err) => {
        setAddressError(err?.message);
      });
  };

  const GetAllOrders = () => {
    axios
      .get(`${BackendLink}/GetAllSaleUser`, {
        headers: {
          Authorization: Token
            ? `${Token}`
            : `${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res?.data?.status == 200) {
          setAllOrders(res?.data?.data?.reverse());
        } else {
          setOrdersError(res?.data?.message);
        }
      })
      .catch((err) => {
        setOrdersError(err?.message);
      });
  };


  const getUniqueMaterials = () => {
    // Extract all currentMaterial values
    const materials = AllProduct.map(product => product.currentMaterial);

    // Create a Set to get unique values
    const uniqueMaterials = [...new Set(materials)];

    return uniqueMaterials;
  };


  const getUniqueColors = () => {
    // Extract all currentColor values
    const Colors = AllProduct.map(product => product.currentColor);

    // Create a Set to get unique values
    const uniqueColors = [...new Set(Colors)];

    return uniqueColors;
  };



  const getUniqueSize = () => {
    // Extract all currentSize values
    const Size = AllProduct.map(product => product.currentSize);

    // Create a Set to get unique values
    const uniqueSize = [...new Set(Size)];

    return uniqueSize;
  };
  useEffect(() => {
    CheckToken();
    GetAllAddress();
    GetAllBrand();
    GetAllCategories();
    GetAllProduct();
    GetAllOrders()
    getUniqueMaterials()
  }, [])

  function shuffleArr(array) {
    const arr = [...array]
    let currentIndex = arr.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [arr[currentIndex], arr[randomIndex]] = [
        arr[randomIndex], arr[currentIndex]];
    }
    return arr
  }

  return (
    <ProductContext.Provider
      value={{
        GetAllProduct,
        AllProduct,
        ProductError,
        GetAllCategories,
        AllCategories,
        CategoriesError,
        GetAllBrand,
        AllBrand,
        BrandError,
        GetAllAddress,
        AllAddress,
        AddressError,
        GetAllOrders,
        AllOrders,
        OrdersError,
        Materials: getUniqueMaterials()?.filter((a) => a != "-"),
        AllColors: getUniqueColors()?.filter((a) => a != "-"),
        AllSizes: getUniqueSize()?.filter((a) => a != "-"),
        shuffleArr
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default withAuthContext(ProductProvider);
