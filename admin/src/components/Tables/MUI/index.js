import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import "./style.css";

export default function DataGridDemo({ rows, columns }) {
  const getRowId = (row) => row?._id;

  const getRowHeight = () => 90;
  return (
    <div
      style={{
        height: rows?.length > 10 ? 700 : rows?.length * 100 + 200,
        padding: "0px 10px",
        marginBottom: "50px",
        overflowX: "auto",
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10, 15, 20, 25, 30, 40, 50, 100]}
        slots={{
          toolbar: GridToolbar,
        }}
        style={{
          overflowX: "auto",
          width: "100%",
        }}
        sx={{ overflowX: "scroll", width: "100%" }}
        getRowId={getRowId}
        getRowHeight={getRowHeight}
        disableSelectionOnClick
      />
    </div>
  );
}
