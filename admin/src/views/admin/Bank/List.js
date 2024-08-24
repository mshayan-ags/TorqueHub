import MUI from "../../../components/Tables/MUI/index";
import { withBankContext } from "context/Bank";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Tables = ({
  AllBank,
  GetAllBank,
  BankError,
  SelectBank,
}) => {
  useEffect(() => {
    GetAllBank();
  }, []);

  const navigate = useNavigate();

  const Columns = [
    // {
    //   headerName: "Action",
    //   renderCell: ({ row }) => (
    //     <button
    //       onClick={() => {
    //         if (SelectBank) {
    //           SelectBank(row?._id);
    //         } else {
    //           navigate(`/admin/AddBank/${row?._id}`);
    //         }
    //       }}
    //       className="linear w-full rounded-xl bg-brand-500 py-[4px] text-[12px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
    //     >
    //       {SelectBank ? "Select" : "Edit"}
    //     </button>
    //   ),
    // },
    {
      headerName: "bank_name",
      field: "bank_name",
    },
    {
      headerName: "account_number",
      field: "account_number",
    },
     {
      headerName: "account_type",
      field: "account_type",
    },
    {
      headerName: "routing_number",
      field: "routing_number",
    },
     {
      headerName: "holder_name",
      field: "holder_name",
    },
    {
      headerName: "is_default",
      field: "is_default",
    },
     {
      headerName: "is_verified",
      field: "is_verified",
    },
  ];
  return (
    <div>
      <div class="my-10 mt-5 h-full rounded-[50px] bg-white px-8 pb-20 pt-8">
        <div class="mb-10 grid grid-cols-3 gap-8">
          <h4 className="col-span-2 text-2xl font-bold text-navy-700 dark:text-white">
            All Banks
          </h4>
        </div>
        {BankError ? (
          <p>
            <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
              {BankError}
            </h4>
          </p>
        ) : (
          <MUI columns={Columns} rows={AllBank} />
        )}
      </div>
    </div>
  );
};

export default withBankContext(Tables);
