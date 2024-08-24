import MUI from "../../../components/Tables/MUI/index";
import { withDiscountContext } from "context/Discount";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Tables = ({
  AllDiscount,
  GetAllDiscount,
  DiscountError,
  SelectDiscount,
}) => {
  useEffect(() => {
    GetAllDiscount();
  }, []);

  const navigate = useNavigate();

  const Columns = [
    {
      headerName: "Action",
      renderCell: ({ row }) => (
        <button
          onClick={() => {
            if (SelectDiscount) {
              SelectDiscount(row?._id);
            } else {
              navigate(`/admin/AddDiscount/${row?._id}`);
            }
          }}
          className="linear w-full rounded-xl bg-brand-500 py-[4px] text-[12px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          {SelectDiscount ? "Select" : "Edit"}
        </button>
      ),
    },
    {
      headerName: "type",
      field: "type",
    },
    {
      headerName: "value",
      field: "value",
    },
    {
      headerName: "DiscountType",
      field: "DiscountType",
    },
    {
      headerName: "startDate",
      field: "startDate",
    },
    {
      headerName: "endDate",
      field: "endDate",
    },
    {
      headerName: "isActive",
      field: "isActive",
    },
  ];
  return (
    <div>
      <div class="my-10 mt-5 h-full rounded-[50px] bg-white px-8 pb-20 pt-8">
        <div class="mb-10 grid grid-cols-3 gap-8">
          <h4 className="col-span-2 text-2xl font-bold text-navy-700 dark:text-white">
            All Discounts
          </h4>
          <div class="flex w-full justify-end">
            {!SelectDiscount && (
              <button
                onClick={() => navigate(`/admin/AddDiscount/New`)}
                className="linear rounded-xl bg-brand-500 px-10 py-[8px] text-[18px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
              >
                Add Discount
              </button>
            )}
          </div>
        </div>
        {DiscountError ? (
          <p>
            <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
              {DiscountError}
            </h4>
          </p>
        ) : (
          <MUI columns={Columns} rows={AllDiscount} />
        )}
      </div>
    </div>
  );
};

export default withDiscountContext(Tables);
