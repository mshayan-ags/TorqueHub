import { useEffect, useState } from "react";
import Banner from "../../../components/banner";
import InputField from "components/fields/InputField";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert";
import { withAuthContext } from "context/Auth";
import { getMissingFields } from "utils/validate";

const requiredFields = ["name", "description"];

const initialState = {
  name: "",
  description: "",
}
const Category = ({ Token, CheckToken }) => {
  const { id } = useParams()

  const [state, setState] = useState(initialState);

  function handleChange(name, value) {
    setState({ ...state, [name]: value })
  }

  const navigate = useNavigate();


  const GetCategoryInfo = () => {
    if (Token) {
      axios
        .get(`${process.env.REACT_APP_PUBLIC_PATH}/CategoryInfo/${id}`, {
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
          navigate("/admin/Category");
        });
    } else {
      CheckToken();
      GetCategoryInfo()

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
      .post(`${process.env.REACT_APP_PUBLIC_PATH}/${id != "New" ? `Update-Category/${id}` : "Create-Category"}`, state, {
        headers: {
          Authorization: Token
            ? `${Token}`
            : `${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res?.data?.status == 200) {
          setState(initialState)
          navigate("/admin/Category");
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
      GetCategoryInfo()
    }
  }, [id])
  return (
    <div className="mt-3 grid h-full grid-cols-1">
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        <Banner Heading={" Add/Update Categorys"} SubHeading={" Embark on a journey of quality and trust with us, your premier auto parts supplier. From engine to exhaust, our commitment to excellence ensures premium, high-performance parts. Elevate your driving experience with our top-tier products."} />
        <div class="grid grid-cols-4 gap-4 my-10 bg-white rounded-[50px] py-20 px-10">
          <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
            Basic Details
          </h4>
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

          <button onClick={() => handleSubmit()} className="col-span-4 linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200">
            {id != "New" ? "Update" : "Add"} Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default withAuthContext(Category);
