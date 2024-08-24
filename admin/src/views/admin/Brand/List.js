import MUI from "../../../components/Tables/MUI/index";
import { withBrandContext } from "context/Brand";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ImageCloud from "../../../link";

const Tables = ({
  AllBrand,
  GetAllBrand,
  BrandError,
  SelectBrand,
  Heading,
}) => {
  useEffect(() => {
    GetAllBrand();
  }, []);

  const navigate = useNavigate();

  const Columns = [
    {
      headerName: "Action",
      renderCell: ({ row }) => (
        <button
          onClick={() => {
            if (SelectBrand) {
              SelectBrand(row?._id);
            } else {
              navigate(`/admin/AddBrand/${row?._id}`);
            }
          }}
          className="linear w-full rounded-xl bg-brand-500 py-[4px] text-[12px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
        >
          {SelectBrand ? "Select" : "Edit"}
        </button>
      ),
    },
    {
      headerName: "Logo",
      field: "logo",
      renderCell: ({ row }) => (
        <img
          src={`${ImageCloud}/${row?.logo?.filename}`}
          className="linear w-full rounded-xl py-[4px]"
        />
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
    {
      headerName: "country",
      field: "country",
    },
    {
      headerName: "website",
      field: "website",
    },
  ];
  return (
    <div>
      <div class="my-10 mt-5 h-full rounded-[50px] bg-white px-8 pb-20 pt-8">
        <div class="mb-10 grid grid-cols-3 gap-8">
          <h4 className="col-span-2 text-2xl font-bold text-navy-700 dark:text-white">
            {Heading || "All Brands"}
          </h4>
          <div class="flex w-full justify-end">
            {!SelectBrand && (
              <button
                onClick={() => navigate(`/admin/AddBrand/New`)}
                className="linear rounded-xl bg-brand-500 px-10 py-[8px] text-[18px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
              >
                Add Brand
              </button>
            )}
          </div>
        </div>
        {BrandError ? (
          <p>
            <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
              {BrandError}
            </h4>
          </p>
        ) : (
          <MUI columns={Columns} rows={AllBrand} />
        )}
      </div>
    </div>
  );
};

export default withBrandContext(Tables);
