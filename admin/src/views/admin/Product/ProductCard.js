import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { useState } from "react";
import Card from "components/card";
import { useNavigate } from "react-router-dom";

const ProductCard = ({
  name,
  ProductCode,
  price,
  image,
  description,
  extra,
  currentColor,
  currentSize,
  currentMaterial,
  SelectProduct,
  SelectHeading,
  id,
  Discount
}) => {
  const navigate = useNavigate();

  return (
    <Card
      extra={`flex flex-col w-full h-full !p-4 3xl:p-![18px] bg-white ${extra}`}
    >
      <div className="h-full w-full">
        <div className="relative w-full">
          <img
            src={image}
            className="mb-3 h-[250px] w-full rounded-xl 3xl:h-[250px] 3xl:w-full"
            alt=""
          />
        </div>

        <div className="mb-3 flex items-center justify-between px-1 md:flex-col md:items-start lg:flex-row lg:justify-between xl:flex-col xl:items-start 3xl:flex-row 3xl:justify-between">
          <div className="mb-2">
            <p className="text-lg font-bold text-navy-700 dark:text-white">
              {" "}
              {name}{" "}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600 md:mt-2">
              ProductCode: {ProductCode}{" "}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600 md:mt-2">
              currentSize: {currentSize}{" "}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600 md:mt-2">
              currentMaterial: {currentMaterial}{" "}
            </p>
            <p className="font-small mt-1 text-sm text-gray-600 md:mt-2">
              description: {description}{" "}
            </p>
          </div>

          <div className="flex flex-row-reverse md:mt-2 lg:mt-0">
            <div
              className="h-[25px] w-[25px] rounded-full object-cover"
              style={{ backgroundColor: currentColor }}
              alt=""
            />
          </div>
        </div>

        <div className="flex items-center justify-between md:flex-col md:items-start lg:flex-row lg:justify-between xl:flex-col 2xl:items-start 3xl:flex-row 3xl:items-center 3xl:justify-between">
          <div className="flex flex-col">
            <p className="mb-2 text-sm font-bold text-brand-500 dark:text-white">
              Current Price: $ {price}
            </p>
            {Discount?._id && (
              <>
                <p className="mb-2 text-sm font-bold text-brand-500 dark:text-white">
                  Discount: $ {Discount?.DiscountType == 'Percentage' ? (price / 100 * Discount?.value) : Discount?.value}
                </p>
                <p className="mb-2 text-sm font-bold text-brand-500 dark:text-white">
                  Discounted Price: $ {Discount?.DiscountType == 'Percentage' ? price - (price / 100 * Discount?.value) : price - Discount?.value}
                </p>
              </>
            )}
          </div>
          <button
            href=""
            onClick={() => {
              if (SelectProduct) {
                SelectProduct(id);
              } else {
                navigate(`/admin/AddProduct/${id}`);
              }
            }}
            className="linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90"
          >
            {SelectProduct ? SelectHeading : "Edit"}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
