import MUI from "../../../components/Tables/MUI/index";
import { withCategoryContext } from "context/Category";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Tables = ({
  AllCategory,
  GetAllCategory,
  CategoryError,
  SelectCategory,
}) => {
  useEffect(() => {
    GetAllCategory();
  }, []);

  const navigate = useNavigate();

  const Columns = [
    {
      headerName: "Action",
      renderCell: ({ row }) => (
        <button
          onClick={() => {
            if (SelectCategory) {
              SelectCategory(row?._id);
            } else {
              navigate(`/admin/AddCategory/${row?._id}`);
            }
          }}
          className="linear w-full rounded-xl bg-brand-500 py-[4px] text-[12px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          {SelectCategory ? "Select" : "Edit"}
        </button>
      ),
    },
    {
      headerName: "name",
      field: "name",
    },
    {
      headerName: "description",
      field: "description",
    },
  ];
  return (
    <div>
      <div class="my-10 mt-5 h-full rounded-[50px] bg-white px-8 pb-20 pt-8">
        <div class="mb-10 grid grid-cols-3 gap-8">
          <h4 className="col-span-2 text-2xl font-bold text-navy-700 dark:text-white">
            All Categorys
          </h4>
          <div class="flex w-full justify-end">
            {!SelectCategory && (
              <button
                onClick={() => navigate(`/admin/AddCategory/New`)}
                className="linear rounded-xl bg-brand-500 px-10 py-[8px] text-[18px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
              >
                Add Category
              </button>
            )}
          </div>
        </div>
        {CategoryError ? (
          <p>
            <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
              {CategoryError}
            </h4>
          </p>
        ) : (
          <MUI columns={Columns} rows={AllCategory} />
        )}
      </div>
    </div>
  );
};

export default withCategoryContext(Tables);
