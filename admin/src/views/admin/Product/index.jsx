import { useEffect, useState } from "react";
import Banner from "../../../components/banner";
import InputField from "components/fields/InputField";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert";
import { withAuthContext } from "context/Auth";
import Upload from "./Upload";
import Dropdown from "components/dropdown";
import { withBrandContext } from "context/Brand";
import { withCategoryContext } from "context/Category";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import ProductCard from "./ProductCard";
import ImageCloud from "../../../link";
import { getMissingFields } from "utils/validate";

const requiredFields = [
  "ProductCode",
  "name",
  "description",
  "specifications",
  "weight",
  "dimensions",
  "warranty",
  "price",
  "quantity",
];

const initialState = {
  ProductCode: "",
  name: "",
  description: "",
  currentColor: "",
  condition: "New",
  currentSize: "",
  currentMaterial: "",
  weight: "",
  dimensions: "",
  warranty: "",
  specifications: "",
  price: 0,
  category: "",
  brand: "",
  quantity: 0,
  images: [],
  preview: [],
  color: [],
  size: [],
  material: [],
}
const Product = ({ Token, CheckToken,
  AllBrand,
  GetAllBrand,
  BrandError,
  AllCategory,
  GetAllCategory,
  CategoryError, }) => {
  useEffect(() => {
    GetAllBrand();
    GetAllCategory();
  }, []);
  const { id } = useParams()

  const [state, setState] = useState(initialState);

  function handleChange(name, value) {
    setState({ ...state, [name]: value })
  }

  const navigate = useNavigate();


  const GetProductInfo = () => {
    if (Token) {
      axios
        .get(`${process.env.REACT_APP_PUBLIC_PATH}/ProductInfo/${id}`, {
          headers: {
            Authorization: Token
              ? `${Token}`
              : `${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          if (res?.data?.status == 200) {
            const images = [];
            res?.data?.data?.images?.map((a) => {
              images.push(`${ImageCloud}/${a?.filename}`,
              )
            })
            setState({
              ...res?.data?.data,
              preview: images,
              images: [],
              weight: res?.data?.data?.technical_specs?.weight,
              dimensions: res?.data?.data?.technical_specs?.dimensions,
              warranty: res?.data?.data?.technical_specs?.warranty,
            })
          }
        })
        .catch((err) => {
          swal({
            text: err?.response?.data?.message
              ? err?.response?.data?.message
              : "There was some Error",
            button: {
              text: "Ok",
              closeModal: true,
            },
            icon: "error",
            time: 3000,
          });
          navigate("/admin/Product");
        });
    } else {
      CheckToken();
      GetProductInfo()

    }
  };

  const handleSubmit = () => {
    if (!Token) {
      swal({
        text: "You are not logged in. Please sign in again.",
        button: {
          text: "Ok",
          closeModal: true,
        },
        icon: "error",
        time: 3000,
      });
      CheckToken();
      return;
    }

    const missing = getMissingFields(state, requiredFields);
    if (missing.length > 0) {
      swal({
        text: `Please fill in the following required fields: ${missing.join(", ")}`,
        button: {
          text: "Ok",
          closeModal: true,
        },
        icon: "error",
        time: 3000,
      });
      return;
    }

    axios
      .post(`${process.env.REACT_APP_PUBLIC_PATH}/${id != "New" ? `Update-Product/${id}` : "Create-Product"}`, state, {
        headers: {
          Authorization: Token
            ? `${Token}`
            : `${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res?.data?.status == 200) {
          setState(initialState)
          navigate("/admin/Product");
        }

        swal({
          text: res?.data?.message,
          button: {
            text: "Ok",
            closeModal: true,
          },
          icon: res?.data?.status == 200 ? "success" : "error",
          time: 3000,
        });
      })
      .catch((err) => {
        const message = err?.response?.data?.message || "There was some Error"
        swal({
          text: message,
          button: {
            text: "Ok",
            closeModal: true,
          },
          icon: "error",
          time: 3000,
        });
      });
  };

  useEffect(() => {
    if (id != "New") {
      GetProductInfo()
    }
  }, [id])



  const handleImageSelected = (imageData) => {
    const images = state?.images ? [...state?.images] : []
    const preview = state?.preview ? [...state?.preview] : []
    images.push(imageData);
    preview.push(imageData?.data);
    setState({ ...state, preview: preview, images: images });
  };



  const handleRemove = (Obj) => {
    if (Token && state?.ProductCode) {
      axios
        .post(
          `${process.env.REACT_APP_PUBLIC_PATH}/Remove-Product-Accesories/${state?.ProductCode}`,
          Obj,
          {
            headers: {
              Authorization: Token
                ? `${Token}`
                : `${localStorage.getItem("token")}`,
            },
          }
        )
        .then((res) => {
          if (res?.data?.status == 200) {
            GetProductInfo()
          }
          swal({
            text: res?.data?.message,
            button: {
              text: "Ok",
              closeModal: true,
            },
            icon: res?.data?.status == 200 ? "success" : "error",
            time: 3000,
          });
        })
        .catch((err) => {
          swal({
            text: "There was some Error",
            button: {
              text: "Ok",
              closeModal: true,
            },
            icon: "error",
            time: 3000,
          });
        });
    } else {
      swal({
        text: "Please Check All Fields As There was some Error",
        button: {
          text: "Ok",
          closeModal: true,
        },
        icon: "error",
        time: 3000,
      });
      CheckToken();
      handleRemove();
    }
  };


  return (
    <div className="mt-3 grid h-full grid-cols-1">
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        <Banner Heading={" Add/Update Products"} SubHeading={" Embark on a journey of quality and trust with us, your premier auto parts supplier. From engine to exhaust, our commitment to excellence ensures premium, high-performance parts. Elevate your driving experience with our top-tier products."} />
        <div class="grid grid-cols-4 gap-4 my-10 bg-white rounded-[50px] py-20 px-10">
          <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
            Basic Details
          </h4>
          <InputField
            variant="auth"
            extra="mb-3"
            label="ProductCode*"
            id="ProductCode"
            type="text"
            name="ProductCode"
            value={state?.ProductCode}
            onChange={(e) => handleChange("ProductCode", e.target.value)}
          />
          <InputField
            variant="auth"
            extra="mb-3"
            label="name*"
            id="name"
            type="text"
            name="name"
            value={state?.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <InputField
            variant="auth"
            extra="mb-3"
            label="description*"
            id="description"
            type="text"
            name="description"
            value={state?.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />

          <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
            Product Details
          </h4>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="currentColorLabel">currentColor</InputLabel>

            <Select
              label="currentColor"
              labelId="currentColorLabel"
              id="currentColor"
              name="currentColor"
              value={state?.currentColor}
              onChange={(e) => handleChange("currentColor", e.target.value)}
            >
              {[
                "black",
                "brown",
                "multi-color",
                "orange",
                "blue",
                "pink",
                "off white",
                "green",
                "purple",
                "yellow"
              ]?.map((a) => (
                <MenuItem value={a}>{a}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="conditionLabel">condition</InputLabel>

            <Select
              label="condition"
              labelId="conditionLabel"
              id="condition"
              name="condition"
              value={state?.condition}
              onChange={(e) => handleChange("condition", e.target.value)}
            >
              {[
                "New",
                "Used",
                "Refurbished",
                "OEM",
                "Aftermarket"
              ]?.map((a) => (
                <MenuItem value={a}>{a}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="currentSizeLabel">currentSize</InputLabel>

            <Select
              label="currentSize"
              labelId="currentSizeLabel"
              id="currentSize"
              name="currentSize"
              value={state?.currentSize}
              onChange={(e) => handleChange("currentSize", e.target.value)}
            >
              {[
                "large",
                "medium",
                "small",
                "giant",
                "toy",
                "x-large",
                "any",
                "x-small",
                "softchews",
                "xx-large"
              ]?.map((a) => (
                <MenuItem value={a}>{a}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="currentMaterialLabel">currentMaterial</InputLabel>

            <Select
              label="currentMaterial"
              labelId="currentMaterialLabel"
              id="currentMaterial"
              name="currentMaterial"
              value={state?.currentMaterial}
              onChange={(e) => handleChange("currentMaterial", e.target.value)}
            >
              {[
                "Ceramic",
                "Semi-Metallic",
                "Aluminum",
                "Carbon Fiber"
              ]?.map((a) => (
                <MenuItem value={a}>{a}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
            Specifications Details
          </h4>

          <InputField
            variant="auth"
            extra="mb-3"
            label="specifications*"
            id="specifications"
            type="text"
            name="specifications"
            value={state?.specifications}
            onChange={(e) => handleChange("specifications", e.target.value)}
          />
          <InputField
            variant="auth"
            extra="mb-3"
            label="weight*"
            id="weight"
            type="text"
            name="weight"
            value={state?.weight}
            onChange={(e) => handleChange("weight", e.target.value)}
          />
          <InputField
            variant="auth"
            extra="mb-3"
            label="dimensions*"
            id="dimensions"
            type="text"
            name="dimensions"
            value={state?.dimensions}
            onChange={(e) => handleChange("dimensions", e.target.value)}
          />
          <InputField
            variant="auth"
            extra="mb-3"
            label="warranty*"
            id="warranty"
            type="text"
            name="warranty"
            value={state?.warranty}
            onChange={(e) => handleChange("warranty", e.target.value)}
          />
          <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
            Brand And Other Details
          </h4>
          {!BrandError && (
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="BrandLabel">Brand</InputLabel>

              <Select
                label="brand"
                labelId="BrandLabel"
                id="brand"
                name="brand"
                value={state?.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
              >
                {AllBrand?.length && AllBrand?.map((a) => (
                  <MenuItem value={a?._id}>{a?.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {!CategoryError && (
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="categoryLabel">Category</InputLabel>

              <Select
                label="category"
                labelId="categoryLabel"
                id="category"
                name="category"
                value={state?.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                {AllCategory?.length && AllCategory?.map((a) => (
                  <MenuItem value={a?._id}>{a?.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <InputField
            variant="auth"
            extra="mb-3"
            label="price*"
            id="price"
            type="number"
            name="price"
            value={state?.price}
            onChange={(e) => handleChange("price", e.target.value)}
          />
          <InputField
            variant="auth"
            extra="mb-3"
            label="quantity*"
            id="quantity"
            type="text"
            name="quantity"
            value={state?.quantity}
            disabled={id != "New"}
            onChange={(e) => handleChange("quantity", e.target.value)}
          />

          <div className="col-span-4">
            <Upload
              onImageSelected={handleImageSelected}
              preview={state?.preview}
            />
          </div>

          <button onClick={() => handleSubmit()} className="col-span-4 mb-[5%] linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200">
            {id != "New" ? "Update" : "Add"} Product
          </button>

          {id != "New" &&
            <div className="col-span-4">
              <div className="flex flex-row justify-between ">
                <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
                  {state?.color?.length > 0 ? "Colors" : "No Colors To Show"}
                </h4>

                <button onClick={() => { if (state?.ProductCode && id) navigate(`/SelectProduct/${state?.ProductCode}/Color/${id}`) }} className="linear mt-2 w-[50%] rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200">
                  Add Product Colors
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {state?.color?.length > 0 &&
                  state?.color?.map((a) => (
                    <ProductCard
                      name={a?.name}
                      ProductCode={a?.ProductCode}
                      price={a?.price}
                      image={`${ImageCloud}/${a?.images?.[0]?.filename}`}
                      description={a?.description}
                      currentColor={a?.currentColor}
                      currentSize={a?.currentSize}
                      id={a?._id}
                      SelectHeading={"Remove"}
                      SelectProduct={(id) => {
                        handleRemove({
                          ColorProductId: id,
                        });
                      }}
                      currentMaterial={a?.currentMaterial}
                    />
                  ))}
              </div>
            </div>}



          {id != "New" &&
            <div className="col-span-4">
              <div className="flex flex-row justify-between ">
                <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
                  {state?.size?.length > 0 ? "Sizes" : "No Sizes To Show"}
                </h4>

                <button onClick={() => { if (state?.ProductCode && id) navigate(`/SelectProduct/${state?.ProductCode}/Size/${id}`) }} className="linear mt-2 w-[50%] rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200">
                  Add Product Sizes
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {state?.size?.length > 0 &&
                  state?.size?.map((a) => (
                    <ProductCard
                      name={a?.name}
                      ProductCode={a?.ProductCode}
                      price={a?.price}
                      image={`${ImageCloud}/${a?.images?.[0]?.filename}`}
                      description={a?.description}
                      currentColor={a?.currentColor}
                      currentSize={a?.currentSize}
                      id={a?._id}
                      SelectHeading={"Remove"}
                      SelectProduct={(id) => {
                        handleRemove({
                          SizeProductId: id,
                        });
                      }}
                      currentMaterial={a?.currentMaterial}
                    />
                  ))}
              </div>
            </div>}

          {id != "New" &&
            <div className="col-span-4">
              <div className="flex flex-row justify-between ">
                <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
                  {state?.material?.length > 0 ? "Materials" : "No Materials To Show"}
                </h4>

                <button onClick={() => { if (state?.ProductCode && id) navigate(`/SelectProduct/${state?.ProductCode}/Material/${id}`) }} className="linear mt-2 w-[50%] rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200">
                  Add Product Materials
                </button>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {state?.material?.length > 0 &&
                  state?.material?.map((a) => (
                    <ProductCard
                      name={a?.name}
                      ProductCode={a?.ProductCode}
                      price={a?.price}
                      image={`${ImageCloud}/${a?.images?.[0]?.filename}`}
                      description={a?.description}
                      currentColor={a?.currentColor}
                      currentSize={a?.currentSize}
                      id={a?._id}
                      SelectHeading={"Remove"}
                      SelectProduct={(id) => {
                        handleRemove({
                          MaterialProductId: id,
                        });
                      }}
                      currentMaterial={a?.currentMaterial}
                    />
                  ))}
              </div>
            </div>}
        </div>


      </div>
    </div>
  );
};

export default withAuthContext(withBrandContext(withCategoryContext(Product)));
