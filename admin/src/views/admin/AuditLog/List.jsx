import MUI from "../../../components/Tables/MUI/index";
import { withAuditLogContext } from "context/AuditLog";
import { useEffect } from "react";
import moment from "moment";

const Tables = ({ AllAuditLog, GetAllAuditLog, AuditLogError }) => {
  useEffect(() => {
    GetAllAuditLog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Columns = [
    {
      headerName: "When",
      field: "created_at",
      width: 180,
      renderCell: ({ row }) => (row?.created_at ? moment(row.created_at).format("DD MMM YYYY, h:mm A") : "-"),
    },
    {
      headerName: "Admin",
      field: "admin",
      renderCell: ({ row }) => row?.Admin?.name || row?.Admin?.email || "-",
    },
    {
      headerName: "Action",
      field: "action",
    },
    {
      headerName: "Target",
      field: "targetType",
    },
    {
      headerName: "Summary",
      field: "summary",
      width: 320,
    },
  ];

  return (
    <div>
      <div class="my-10 mt-5 h-full rounded-[50px] bg-white px-8 pb-20 pt-8">
        <div class="mb-10 grid grid-cols-3 gap-8">
          <h4 className="col-span-2 text-2xl font-bold text-navy-700 dark:text-white">
            Audit Log
          </h4>
        </div>
        {AuditLogError ? (
          <p>
            <h4 className="col-span-4 mb-2.5 text-2xl font-bold text-navy-700 dark:text-white">
              {AuditLogError}
            </h4>
          </p>
        ) : (
          <MUI columns={Columns} rows={AllAuditLog} />
        )}
      </div>
    </div>
  );
};

export default withAuditLogContext(Tables);
