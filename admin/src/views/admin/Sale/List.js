import MUI from "../../../components/Tables/MUI/index";
import { withSaleContext } from "context/Sale";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Tables = ({
  AllSale,
  GetAllSale,
  SaleError,
  SelectSale,
}) => {
  useEffect(() => {
    GetAllSale();
  }, []);

  const navigate = useNavigate();

  const Columns = [
    {
      headerName: "Action",
      renderCell: ({ row }) => (
        <button
          onClick={() => {
            navigate(`/admin/EditSale/${row?._id}`);
          }}
        >
          View
        </button>
      ),
    },
    {
      headerName: "status",
      field: "status",
      renderCell: ({ row }) => (
        <button
          className="linear w-full rounded-xl bg-brand-500 py-[4px] text-[12px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          {row?.status}
        </button>
      ),
    },
    {
      headerName: "totalAmount",
      field: "totalAmount",
    },
    {
      headerName: "totalAmountAfterDiscount",
      field: "totalAmountAfterDiscount",
    },
    {
      headerName: "paymentMethod",
      field: "paymentMethod",
    },
    {
      headerName: "Notes",
      field: "Notes",
    },
    {
      headerName: "Address",
      field: "Address",
    },

  ];
  return (
    <div>
      <div class="my-10 mt-5 h-full rounded-[50px] bg-white px-8 pb-20 pt-8">
        <div class="mb-10 grid grid-cols-3 gap-8">
          <h4 className="col-span-2 text-2xl font-bold text-navy-700 dark:text-white">
            All Sales
          </h4>
        </div>
        {SaleError ? (
          <p>
            <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
              {SaleError}
            </h4>
          </p>
        ) : (
          <MUI columns={Columns} rows={AllSale} />
        )}
      </div>
    </div>
  );
};

export default withSaleContext(Tables);
