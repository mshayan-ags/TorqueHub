import ProductCard from "./ProductCard";
import { useEffect } from "react";
import { withProductContext } from "context/Product";
import { useNavigate } from "react-router-dom";
import ImageCloud from "../../../link";

const Products = ({ AllProduct, GetAllProduct, ProductError, SelectProduct, SelectProductArr, RemoveProduct }) => {
  useEffect(() => {
    GetAllProduct();
  }, []);
  const navigate = useNavigate();
  return (
    <div className="col-span-2 h-fit w-full xl:col-span-1 2xl:col-span-2">
      <div className="mb-4 mt-5 flex flex-col justify-between px-4 md:flex-row md:items-center">
        <h4 className="ml-1 text-2xl font-bold text-navy-700 dark:text-white">
          {ProductError || AllProduct?.length == 0
            ? `${ProductError || "No Products To Show"}`
            : "Products"}
        </h4>
        <div class="flex w-full justify-end">
          <button
            onClick={() => navigate(`/admin/AddProduct/New`)}
            className="linear rounded-xl bg-brand-500 px-10 py-[8px] text-[18px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            Add Product
          </button>
        </div>
      </div>{" "}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {!ProductError &&
          AllProduct?.length > 0 &&
          AllProduct?.map((a) => (
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
              SelectProduct={SelectProductArr?.filter((b) => b == a?._id)?.length <= 0 ? SelectProduct : RemoveProduct}
              SelectHeading={SelectProduct ? SelectProductArr?.filter((b) => b == a?._id)?.length <= 0 ? "Select" : "Remove" : null}
              Discount={a?.Discount}
            />
          ))}
      </div>
    </div>
  );
};

export default withProductContext(Products);
