import { useEffect, useState } from "react";
import Banner from "../../../components/banner";
import InputField from "components/fields/InputField";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert";
import { withAuthContext } from "context/Auth";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import moment from "moment";
import { getMissingFields } from "utils/validate";

const requiredFields = [
  "code",
  "discountValue",
  "minimumPurchase",
  "expirationDate",
  "restrictions",
];

const initialState = {
  code: "",
  discountType: "",
  discountValue: "",
  minimumPurchase: "",
  expirationDate: "",
  restrictions: "",
  isActive: true,
}
const Coupon = ({ Token, CheckToken }) => {
  const { id } = useParams()

  const [state, setState] = useState(initialState);

  function handleChange(name, value) {
    setState({ ...state, [name]: value })
  }

  const navigate = useNavigate();


  const GetCouponInfo = () => {
    if (Token) {
      axios
        .get(`${process.env.REACT_APP_PUBLIC_PATH}/CouponInfo/${id}`, {
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
          navigate("/admin/Coupon");
        });
    } else {
      CheckToken();
      GetCouponInfo()

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
      .post(`${process.env.REACT_APP_PUBLIC_PATH}/${id != "New" ? `Update-Coupon/${id}` : "Create-Coupon"}`, state, {
        headers: {
          Authorization: Token
            ? `${Token}`
            : `${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res?.data?.status == 200) {
          setState(initialState)
          navigate("/admin/Coupon");
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
      GetCouponInfo()
    }
  }, [id])
  return (
    <div className="mt-3 grid h-full grid-cols-1">
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        <Banner Heading={" Add/Update Coupons"} SubHeading={" Embark on a journey of quality and trust with us, your premier auto parts supplier. From engine to exhaust, our commitment to excellence ensures premium, high-performance parts. Elevate your driving experience with our top-tier products."} />
        <div class="grid grid-cols-4 gap-4 my-10 bg-white rounded-[50px] py-20 px-10">
          <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
            Basic Details
          </h4>
          <InputField
            variant="auth"
            extra="mb-3"
            label="code*"
            id="code"
            type="text"
            name="code"
            value={state?.code}
            onChange={(e) => handleChange("code", e.target.value)}
          />

          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="discountTypeLabel">discountType</InputLabel>

            <Select
              label="discountType"
              labelId="discountTypeLabel"
              id="discountType"
              name="discountType"
              value={state?.discountType}
              onChange={(e) => handleChange("discountType", e.target.value)}
            >
              {["Percentage", "FixedAmount"]?.map((a) => (
                <MenuItem value={a}>{a}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <InputField
            variant="auth"
            extra="mb-3"
            label="discountValue*"
            id="discountValue"
            type="text"
            name="discountValue"
            value={state?.discountValue}
            onChange={(e) => handleChange("discountValue", e.target.value)}
          />
          <InputField
            variant="auth"
            extra="mb-3"
            label="minimumPurchase*"
            id="minimumPurchase"
            type="text"
            name="minimumPurchase"
            value={state?.minimumPurchase}
            onChange={(e) => handleChange("minimumPurchase", e.target.value)}
          />
          <InputField
            variant="auth"
            extra="mb-3"
            label="expirationDate*"
            id="expirationDate"
            type="datetime-local"
            name="expirationDate"
            value={moment(state?.expirationDate).format("YYYY-MM-DD hh:mm")}
            onChange={(e) => handleChange("expirationDate", e.target.value)}
          />
          <InputField
            variant="auth"
            extra="mb-3"
            label="restrictions*"
            id="restrictions"
            type="text"
            name="restrictions"
            value={state?.restrictions}
            onChange={(e) => handleChange("restrictions", e.target.value)}
          />
          <button onClick={() => handleSubmit()} className="col-span-4 linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200">
            {id != "New" ? "Update" : "Add"} Coupon
          </button>
        </div>
      </div>
    </div>
  );
};

export default withAuthContext(Coupon);
