import MUI from "../../../components/Tables/MUI/index";
import { withUserContext } from "context/User";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserIcon from "../../../assets/img/avatars/avatar1.png"
import ImageCloud from "../../../link";

const Tables = ({
  AllUser,
  GetAllUser,
  UserError,
  SelectUser,
}) => {
  useEffect(() => {
    GetAllUser();
  }, []);

  const navigate = useNavigate();

  const Columns = [
    // {
    //   headerName: "Action",
    //   renderCell: ({ row }) => (
    //     <button
    //       onClick={() => {
    //         if (SelectUser) {
    //           SelectUser(row?._id);
    //         } else {
    //           navigate(`/admin/AddUser/${row?._id}`);
    //         }
    //       }}
    //       className="linear w-full rounded-xl bg-brand-500 py-[4px] text-[12px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
    //     >
    //       {SelectUser ? "Select" : "Edit"}
    //     </button>
    //   ),
    // },
    {
      headerName: "profilePicture",
      field: "profilePicture",
       renderCell: ({ row }) => (
       	<img
					src={
						row?.profilePicture?.filename
							? `${ImageCloud}/${row?.profilePicture?.filename}`
							: UserIcon
					}
					style={{
						width: "50px",
						height: "50px",
						borderRadius: "50px",
						border: "1px solid #000"
					}}
				/>
      ),
    },
    {
      headerName: "name",
      field: "name",
    },
    {
      headerName: "email",
      field: "email",
    },
     {
      headerName: "phoneNumber",
      field: "phoneNumber",
    },
     {
      headerName: "isVerified",
      field: "isVerified",
    },
    {
      headerName: "otp",
      field: "otp",
    },
     {
      headerName: "subscriber",
      field: "subscriber",
    },
    ];
  return (
    <div>
      <div class="my-10 mt-5 h-full rounded-[50px] bg-white px-8 pb-20 pt-8">
        <div class="mb-10 grid grid-cols-3 gap-8">
          <h4 className="col-span-2 text-2xl font-bold text-navy-700 dark:text-white">
            All Users
          </h4>
        </div>
        {UserError ? (
          <p>
            <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
              {UserError}
            </h4>
          </p>
        ) : (
          <MUI columns={Columns} rows={AllUser} />
        )}
      </div>
    </div>
  );
};

export default withUserContext(Tables);
