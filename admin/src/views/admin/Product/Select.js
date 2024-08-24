import ProductCard from "./ProductCard";
import { useEffect } from "react";
import { withProductContext } from "context/Product";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert";
import { withAuthContext } from "context/Auth";
import ImageCloud from "../../../link";

const Products = ({
  AllProduct,
  GetAllProduct,
  ProductError,
  Token,
  CheckToken,
}) => {
  useEffect(() => {
    GetAllProduct();
  }, []);

  const navigate = useNavigate();
  const { Type, ProductCode, id } = useParams();

  const handleSubmit = (Obj) => {
    if (Token && ProductCode) {
      axios
        .post(
          `${process.env.REACT_APP_PUBLIC_PATH}/Add-Product-Accesories/${ProductCode}`,
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
            navigate(`/admin/AddProduct/${id}`);
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
      handleSubmit();
    }
  };

  return (
    <div className="col-span-2 h-fit w-full xl:col-span-1 2xl:col-span-2">
      <div className="mb-4 mt-5 flex flex-col justify-between px-4 md:flex-row md:items-center">
        <h4 className="ml-1 text-2xl font-bold text-navy-700 dark:text-white">
          Select Products
        </h4>
      </div>{" "}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {ProductError ? (
          <p>
            <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
              {ProductError}
            </h4>
          </p>
        ) : (
          AllProduct?.filter((b) => {
            if (b?._id !== id && b?.ProductCode == ProductCode) {
              return b;
            }
          }).map((a) => (
            <ProductCard
              name={a?.name}
              ProductCode={a?.ProductCode}
              price={a?.price}
              image={`${ImageCloud}/${a?.images?.[0]?.filename}`}
              description={a?.description}
              currentColor={a?.currentColor}
              currentSize={a?.currentSize}
              id={a?._id}
              currentMaterial={a?.currentMaterial}
              SelectHeading="Select"
              SelectProduct={(id) => {
                if (Type == "Color") {
                  handleSubmit({
                    ColorProductId: id,
                  });
                } else if (Type == "Size") {
                  handleSubmit({
                    SizeProductId: id,
                  });
                } else if (Type == "Material") {
                  handleSubmit({
                    MaterialProductId: id,
                  });
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default withProductContext(withAuthContext(Products));
