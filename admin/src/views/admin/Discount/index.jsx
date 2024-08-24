import { useEffect, useState } from "react";
import Banner from "../../../components/banner";
import InputField from "components/fields/InputField";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert";
import { withAuthContext } from "context/Auth";
import BrandList from "../Brand/List"
import CategoryList from "../Category/List"
import ProductList from "../Product/List"
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import moment from "moment";
import Widget from "components/widget/Widget";
import { MdBarChart } from "react-icons/md";
import { getMissingFields } from "utils/validate";

const requiredFields = ["value", "startDate", "endDate"];

const initialState = {
  type: "Brand",
  DiscountType: "Percentage",
  value: 0,
  startDate: new Date(),
  endDate: new Date(),
  isActive: true,
  targetType: "",
  Products: [],
};
const Discount = ({ Token, CheckToken }) => {
  const { id } = useParams();

  const [state, setState] = useState(initialState);
  const [Brand, setBrand] = useState(false);
  const [Category, setCategory] = useState(false);
  const [Product, setProduct] = useState(false);

  function handleChange(name, value) {
    setState({ ...state, [name]: value });
  }

  const navigate = useNavigate();

  const GetDiscountInfo = () => {
    if (Token) {
      axios
        .get(`${process.env.REACT_APP_PUBLIC_PATH}/DiscountInfo/${id}`, {
          headers: {
            Authorization: Token
              ? `${Token}`
              : `${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          if (res?.data?.status == 200) {
            setState({
              ...res?.data?.data,
              startDate: new Date(res?.data?.data?.startDate),
              endDate: new Date(res?.data?.data?.endDate)
            });
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
          navigate("/admin/Discount");
        });
    } else {
      CheckToken();
      GetDiscountInfo();
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
      .post(
        `${process.env.REACT_APP_PUBLIC_PATH}/${id != "New" ? `Update-Discount/${id}` : "Create-Discount"
        }`,
        state,
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
          setState(initialState);
          navigate("/admin/Discount");
        }
        swal({
          text: res?.data?.status == 200 ? res?.data?.message : res?.data?.message ? res?.data?.message : "THere is Some Error",
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
      });
  };

  useEffect(() => {
    if (id != "New") {
      GetDiscountInfo();
    }
  }, [id]);
  return (
    <div className="mt-3 grid h-full grid-cols-1">
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        <Banner
          Heading={" Add/Update Discounts"}
          SubHeading={
            " Embark on a journey of quality and trust with us, your premier auto parts supplier. From engine to exhaust, our commitment to excellence ensures premium, high-performance parts. Elevate your driving experience with our top-tier products."
          }
        />
        <div class="my-10 grid grid-cols-4 gap-4 rounded-[50px] bg-white px-10 py-20">
          <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
            Basic Details
          </h4>
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="DiscountTypeLabel">DiscountType</InputLabel>

            <Select
              label="DiscountType"
              labelId="DiscountTypeLabel"
              id="DiscountType"
              name="DiscountType"
              value={state?.DiscountType}
              onChange={(e) => handleChange("DiscountType", e.target.value)}
            >
              {["Percentage", "FixedAmount"]?.map((a) => (
                <MenuItem value={a}>{a}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <InputField
            variant="auth"
            extra="mb-3"
            label="value*"
            id="value"
            type="number"
            name="value"
            value={state?.value}
            onChange={(e) => handleChange("value", e.target.value)}
          />
          <InputField
            variant="auth"
            extra="mb-3"
            label="startDate*"
            id="startDate"
            type="datetime-local"
            name="startDate"
            value={moment(state?.startDate).format("YYYY-MM-DD hh:mm")}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />
          <InputField
            variant="auth"
            extra="mb-3"
            label="endDate*"
            id="endDate"
            type="datetime-local"
            name="endDate"
            value={moment(state?.endDate).format("YYYY-MM-DD hh:mm")}
            onChange={(e) => handleChange("endDate", e.target.value)}
          />

          {!state?.targetType ? (
            <>
              <button
                onClick={() => {
                  setBrand(!Brand)
                  handleChange("type", "Brand");
                }}
                className="linear col-span-1 mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
              >
                Select Brand
              </button>

              <button
                onClick={() => {
                  setCategory(!Category)
                  handleChange("type", "Category");
                }}
                className="linear col-span-1 mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
              >
                Select Category
              </button>
              <button
                onClick={() => {
                  handleChange("type", "Product");
                  setProduct(!Product)
                }}
                className="linear col-span-2 mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
              >
                Select Product
              </button>
            </>
          ) : (
            <div className="w-full  col-span-4">
              <Widget
                icon={<MdBarChart className="h-7 w-7" />}
                title={state?.type}
                subtitle={state?.targetType}
              />
            </div>
          )}

          {Brand && (
            <div className="col-span-4">
              <BrandList SelectBrand={(e) => {
                handleChange("targetType", e);
                setBrand(false)
              }} />
            </div>
          )}

          {Product && (
            <div className="col-span-4">
              <ProductList
                SelectProduct={(e) => {
                  const arr = [...state?.Products]
                  arr.push(e)
                  handleChange("Products", arr)
                }}
                RemoveProduct={(e) => {
                  let arr = [...state?.Products]
                  arr = arr.filter(item => item !== e);
                  handleChange("Products", arr)
                }}
                SelectProductArr={state?.Products}
              />
            </div>
          )}

          {Category && (
            <div className="col-span-4">
              <CategoryList SelectCategory={(e) => {
                handleChange("targetType", e)
                setCategory(false)
              }} />
            </div>
          )}


          <button
            onClick={() => handleSubmit()}
            className="linear col-span-4 mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            {id != "New" ? "Update" : "Add"} Discount
          </button>
        </div>
      </div>
    </div>
  );
};

export default withAuthContext(Discount);
