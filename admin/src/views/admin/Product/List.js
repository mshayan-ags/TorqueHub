import ProductCard from "./ProductCard";
import { useEffect, useRef, useState } from "react";
import { withProductContext } from "context/Product";
import { withAuthContext } from "context/Auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import swal from "sweetalert";
import Papa from "papaparse";
import ImageCloud from "../../../link";

const CSV_FIELDS = [
  "ProductCode", "name", "description", "price", "quantity",
  "currentColor", "currentSize", "currentMaterial", "condition",
  "specifications", "weight", "dimensions", "warranty", "brand", "category",
];

const Products = ({ AllProduct, GetAllProduct, ProductError, SelectProduct, SelectProductArr, RemoveProduct, Token, CheckToken }) => {
  useEffect(() => {
    GetAllProduct();
  }, []);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [ImportRows, setImportRows] = useState(null);
  const [ImportResults, setImportResults] = useState(null);
  const [Importing, setImporting] = useState(false);

  const exportCSV = () => {
    const rows = (AllProduct || []).map((p) => ({
      ProductCode: p?.ProductCode,
      name: p?.name,
      description: p?.description,
      price: p?.price,
      quantity: p?.quantity,
      currentColor: p?.currentColor,
      currentSize: p?.currentSize,
      currentMaterial: p?.currentMaterial,
      condition: p?.condition,
      specifications: p?.specifications,
      weight: p?.technical_specs?.weight,
      dimensions: p?.technical_specs?.dimensions,
      warranty: p?.technical_specs?.warranty,
      brand: p?.brand?.name,
      category: p?.category?.name,
    }));
    const csv = Papa.unparse({ fields: CSV_FIELDS, data: rows });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `products-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImportRows(results.data);
        setImportResults(null);
      },
    });
    e.target.value = "";
  };

  const confirmImport = () => {
    if (!Token) {
      swal({ text: "You are not logged in. Please sign in again.", button: { text: "Ok", closeModal: true }, icon: "error", time: 3000 });
      CheckToken();
      return;
    }
    setImporting(true);
    axios
      .post(`${process.env.REACT_APP_PUBLIC_PATH}/Bulk-Create-Products`, { rows: ImportRows }, {
        headers: { Authorization: `${Token}` },
      })
      .then((res) => {
        setImporting(false);
        if (res?.data?.status == 200) {
          setImportResults(res?.data?.data);
          GetAllProduct();
        }
        swal({
          text: res?.data?.status == 200 ? "Import finished — see the per-row results below" : res?.data?.message,
          button: { text: "Ok", closeModal: true },
          icon: res?.data?.status == 200 ? "success" : "error",
          time: 3000,
        });
      })
      .catch((err) => {
        setImporting(false);
        swal({
          text: err?.response?.data?.message || "There was some Error",
          button: { text: "Ok", closeModal: true },
          icon: "error",
          time: 3000,
        });
      });
  };

  return (
    <div className="col-span-2 h-fit w-full xl:col-span-1 2xl:col-span-2">
      <div className="mb-4 mt-5 flex flex-col justify-between px-4 md:flex-row md:items-center">
        <h4 className="ml-1 text-2xl font-bold text-navy-700 dark:text-white">
          {ProductError || AllProduct?.length == 0
            ? `${ProductError || "No Products To Show"}`
            : "Products"}
        </h4>
        <div class="flex w-full justify-end gap-3">
          <button
            onClick={exportCSV}
            className="linear rounded-xl border border-brand-500 px-6 py-[8px] text-[14px] font-medium text-brand-500 transition duration-200 hover:bg-brand-50"
          >
            Export CSV
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="linear rounded-xl border border-brand-500 px-6 py-[8px] text-[14px] font-medium text-brand-500 transition duration-200 hover:bg-brand-50"
          >
            Import CSV
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelected} />
          <button
            onClick={() => navigate(`/admin/AddProduct/New`)}
            className="linear rounded-xl bg-brand-500 px-10 py-[8px] text-[18px] font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            Add Product
          </button>
        </div>
      </div>{" "}

      {ImportRows?.length > 0 && (
        <div className="mx-4 mb-8 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-bold text-navy-700">
              Preview: {ImportRows.length} row(s) parsed from CSV. Images are not imported — add them per-product afterward.
            </h4>
            <div className="flex gap-2">
              <button
                onClick={confirmImport}
                disabled={Importing}
                className="rounded-xl bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {Importing ? "Importing..." : "Confirm Import"}
              </button>
              <button
                onClick={() => { setImportRows(null); setImportResults(null); }}
                className="rounded-xl border border-gray-200 px-6 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr>
                  {CSV_FIELDS.map((f) => (
                    <th key={f} className="border-b border-gray-200 px-2 py-1 font-semibold">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ImportRows.map((row, i) => (
                  <tr key={i}>
                    {CSV_FIELDS.map((f) => (
                      <td key={f} className="border-b border-gray-100 px-2 py-1">{row?.[f]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {ImportResults?.length > 0 && (
            <div className="mt-6">
              <h5 className="mb-2 text-sm font-bold text-navy-700">Import Results</h5>
              <div className="max-h-48 overflow-auto text-xs">
                {ImportResults.map((r) => (
                  <div key={r.row} className={`flex justify-between border-b border-gray-100 px-2 py-1 ${r.success ? "text-green-600" : "text-red-500"}`}>
                    <span>Row {r.row} ({r.ProductCode || "-"})</span>
                    <span>{r.success ? "Created" : r.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {!ProductError &&
          AllProduct?.length > 0 &&
          AllProduct?.map((a) => (
            <ProductCard
              name={a?.name}
              ProductCode={a?.ProductCode}
              price={a?.price}
              image={`${ImageCloud}/${a?.images?.[0]?.filename}`}
              description={a?.description}
              currentColor={a?.currentColor}
              currentSize={a?.currentSize}
              id={a?._id}
              currentMaterial={a?.currentMaterial}
              SelectProduct={SelectProductArr?.filter((b) => b == a?._id)?.length <= 0 ? SelectProduct : RemoveProduct}
              SelectHeading={SelectProduct ? SelectProductArr?.filter((b) => b == a?._id)?.length <= 0 ? "Select" : "Remove" : null}
              Discount={a?.Discount}
            />
          ))}
      </div>
    </div>
  );
};

export default withAuthContext(withProductContext(Products));
