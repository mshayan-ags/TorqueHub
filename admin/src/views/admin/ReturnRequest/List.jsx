import MUI from "../../../components/Tables/MUI/index";
import { withReturnRequestContext } from "context/ReturnRequest";
import { withAuthContext } from "context/Auth";
import { useEffect } from "react";
import axios from "axios";
import swal from "sweetalert";

const STATUSES = ["Requested", "Approved", "Rejected", "Refunded"];

const Tables = ({ AllReturnRequest, GetAllReturnRequest, ReturnRequestError, Token, CheckToken }) => {
  useEffect(() => {
    GetAllReturnRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = (id, status) => {
    if (!Token) {
      swal({
        text: "You are not logged in. Please sign in again.",
        button: { text: "Ok", closeModal: true },
        icon: "error",
        time: 3000,
      });
      CheckToken();
      return;
    }

    axios
      .post(
        `${process.env.REACT_APP_PUBLIC_PATH}/Update-Return-Status/${id}`,
        { status },
        { headers: { Authorization: `${Token}` } }
      )
      .then((res) => {
        swal({
          text: res?.data?.message,
          button: { text: "Ok", closeModal: true },
          icon: res?.data?.status == 200 ? "success" : "error",
          time: 3000,
        });
        if (res?.data?.status == 200) {
          GetAllReturnRequest();
        }
      })
      .catch((err) => {
        swal({
          text: err?.response?.data?.message
            ? err?.response?.data?.message
            : "There was some Error",
          button: { text: "Ok", closeModal: true },
          icon: "error",
          time: 3000,
        });
      });
  };

  const Columns = [
    {
      headerName: "Action",
      width: 260,
      renderCell: ({ row }) => (
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) setStatus(row?._id, e.target.value);
          }}
          className="rounded-xl border border-gray-200 px-2 py-1 text-[12px]"
        >
          <option value="" disabled>
            Set status...
          </option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
    {
      headerName: "User",
      field: "user",
      renderCell: ({ row }) => row?.User?.name || row?.User?.email || "-",
    },
    {
      headerName: "Product",
      field: "product",
      width: 200,
      renderCell: ({ row }) => row?.SaleOfProduct?.product?.name || "-",
    },
    {
      headerName: "reason",
      field: "reason",
      width: 220,
    },
    {
      headerName: "status",
      field: "status",
      renderCell: ({ row }) => (
        <span className="rounded-full bg-brand-50 px-3 py-1 text-[12px] font-medium text-brand-500">
          {row?.status}
        </span>
      ),
    },
    {
      headerName: "adminNotes",
      field: "adminNotes",
      width: 220,
    },
  ];

  return (
    <div>
      <div class="my-10 mt-5 h-full rounded-[50px] bg-white px-8 pb-20 pt-8">
        <div class="mb-10 grid grid-cols-3 gap-8">
          <h4 className="col-span-2 text-2xl font-bold text-navy-700 dark:text-white">
            Return Requests
          </h4>
        </div>
        {ReturnRequestError ? (
          <p>
            <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
              {ReturnRequestError}
            </h4>
          </p>
        ) : (
          <MUI columns={Columns} rows={AllReturnRequest} />
        )}
      </div>
    </div>
  );
};

export default withAuthContext(withReturnRequestContext(Tables));
