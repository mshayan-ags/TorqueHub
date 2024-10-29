import React, { useEffect, useState } from "react";
import { withVehicleContext } from "../../context/Vehicle";
import { VEHICLE_MAKE_NAMES, VEHICLE_YEARS, getModelsForMake } from "../../constants/vehicleOptions";
import { FaCarSide, FaTimes } from "react-icons/fa";

function VehicleSelector({ Vehicle, setVehicle, clearVehicle }) {
  const [open, setOpen] = useState(false);
  const [make, setMake] = useState(Vehicle?.make || "");
  const [model, setModel] = useState(Vehicle?.model || "");
  const [year, setYear] = useState(Vehicle?.year || "");

  useEffect(() => {
    if (open) {
      setMake(Vehicle?.make || "");
      setModel(Vehicle?.model || "");
      setYear(Vehicle?.year || "");
    }
  }, [open, Vehicle]);

  const handleSave = () => {
    if (!make || !model || !year) return;
    setVehicle({ make, model, year: Number(year) });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#d2d2d7] hover:border-[#f97316] text-sm font-medium text-[#1d1d1f] transition-colors duration-200"
      >
        <FaCarSide className="text-[#f97316]" />
        {Vehicle ? `${Vehicle.year} ${Vehicle.make} ${Vehicle.model}` : "Shop by Vehicle"}
      </button>

      {open && (
        <div className="absolute left-0 md:right-0 md:left-auto mt-2 w-[90vw] max-w-sm bg-white border border-[#d2d2d7] rounded-2xl shadow-xl p-5 z-[10000]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-[#1d1d1f]">Find parts for your vehicle</h4>
            <button onClick={() => setOpen(false)}>
              <FaTimes className="text-[#6e6e73]" />
            </button>
          </div>

          <div className="space-y-3">
            <select
              value={make}
              onChange={(e) => { setMake(e.target.value); setModel(""); }}
              className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] outline-none focus:border-[#f97316] text-sm"
            >
              <option value="">Select Make</option>
              {VEHICLE_MAKE_NAMES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={!make}
              className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] outline-none focus:border-[#f97316] text-sm disabled:bg-[#f5f5f7]"
            >
              <option value="">Select Model</option>
              {getModelsForMake(make).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] outline-none focus:border-[#f97316] text-sm"
            >
              <option value="">Select Year</option>
              {VEHICLE_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 mt-5">
            {Vehicle && (
              <button
                onClick={() => { clearVehicle(); setOpen(false); }}
                className="flex-1 py-2.5 rounded-full border border-[#d2d2d7] text-sm font-medium text-[#6e6e73] hover:bg-[#f5f5f7] transition-colors duration-200"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!make || !model || !year}
              className="flex-1 py-2.5 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            >
              Save Vehicle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default withVehicleContext(VehicleSelector);
