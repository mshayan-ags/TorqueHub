import MUI from "../../../components/Tables/MUI/index";
import { withReviewContext } from "context/Review";
import { withAuthContext } from "context/Auth";
import { useEffect } from "react";
import axios from "axios";
import swal from "sweetalert";

const Tables = ({ AllReview, GetAllReview, ReviewError, Token, CheckToken }) => {
  useEffect(() => {
    GetAllReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setApproval = (id, approve) => {
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
        `${process.env.REACT_APP_PUBLIC_PATH}/${approve ? "Approve-Review" : "Hide-Review"}/${id}`,
        {},
        {
          headers: {
            Authorization: `${Token}`,
          },
        }
      )
      .then((res) => {
        swal({
          text: res?.data?.message,
          button: { text: "Ok", closeModal: true },
          icon: res?.data?.status == 200 ? "success" : "error",
          time: 3000,
        });
        if (res?.data?.status == 200) {
          GetAllReview();
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
      renderCell: ({ row }) => (
        <div className="flex w-full gap-2">
          <button
            onClick={() => setApproval(row?._id, true)}
            className="linear w-full rounded-xl bg-brand-500 py-[4px] text-[12px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            Approve
          </button>
          <button
            onClick={() => setApproval(row?._id, false)}
            className="linear w-full rounded-xl bg-red-500 py-[4px] text-[12px] font-medium text-white transition duration-200 hover:bg-red-600 active:bg-red-700"
          >
            Hide
          </button>
        </div>
      ),
    },
    {
      headerName: "user",
      field: "user",
      renderCell: ({ row }) => row?.user?.name || "-",
    },
    {
      headerName: "targetType",
      field: "targetType",
    },
    {
      headerName: "rating",
      field: "rating",
    },
    {
      headerName: "comment",
      field: "comment",
    },
    {
      headerName: "isApproved",
      field: "isApproved",
      renderCell: ({ row }) => (row?.isApproved ? "Approved" : "Hidden"),
    },
  ];

  return (
    <div>
      <div class="my-10 mt-5 h-full rounded-[50px] bg-white px-8 pb-20 pt-8">
        <div class="mb-10 grid grid-cols-3 gap-8">
          <h4 className="col-span-2 text-2xl font-bold text-navy-700 dark:text-white">
            All Reviews
          </h4>
        </div>
        {ReviewError ? (
          <p>
            <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
              {ReviewError}
            </h4>
          </p>
        ) : (
          <MUI columns={Columns} rows={AllReview} />
        )}
      </div>
    </div>
  );
};

export default withAuthContext(withReviewContext(Tables));
