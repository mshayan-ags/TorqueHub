import MUI from "../../../components/Tables/MUI/index";
import { withBlogContext } from "context/Blog";
import { withAuthContext } from "context/Auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert";

const Tables = ({ AllBlog, GetAllBlog, BlogError, Token, CheckToken }) => {
  useEffect(() => {
    GetAllBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useNavigate();

  const handleDelete = (id) => {
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

    swal({
      text: "Are you sure you want to delete this blog post?",
      buttons: ["Cancel", "Delete"],
      icon: "warning",
      dangerMode: true,
    }).then((confirmed) => {
      if (!confirmed) return;
      axios
        .post(
          `${process.env.REACT_APP_PUBLIC_PATH}/Delete-Blog/${id}`,
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
            GetAllBlog();
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
    });
  };

  const Columns = [
    {
      headerName: "Action",
      renderCell: ({ row }) => (
        <div className="flex w-full gap-2">
          <button
            onClick={() => navigate(`/admin/AddBlog/${row?._id}`)}
            className="linear w-full rounded-xl bg-brand-500 py-[4px] text-[12px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row?._id)}
            className="linear w-full rounded-xl bg-red-500 py-[4px] text-[12px] font-medium text-white transition duration-200 hover:bg-red-600 active:bg-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
    {
      headerName: "title",
      field: "title",
    },
    {
      headerName: "content",
      field: "content",
    },
    {
      headerName: "publicationDate",
      field: "publicationDate",
    },
  ];

  return (
    <div>
      <div class="my-10 mt-5 h-full rounded-[50px] bg-white px-8 pb-20 pt-8">
        <div class="mb-10 grid grid-cols-3 gap-8">
          <h4 className="col-span-2 text-2xl font-bold text-navy-700 dark:text-white">
            All Blogs
          </h4>
          <div class="flex w-full justify-end">
            <button
              onClick={() => navigate(`/admin/AddBlog/New`)}
              className="linear rounded-xl bg-brand-500 px-10 py-[8px] text-[18px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
            >
              Add Blog
            </button>
          </div>
        </div>
        {BlogError ? (
          <p>
            <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
              {BlogError}
            </h4>
          </p>
        ) : (
          <MUI columns={Columns} rows={AllBlog} />
        )}
      </div>
    </div>
  );
};

export default withAuthContext(withBlogContext(Tables));
