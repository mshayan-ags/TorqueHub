import { useEffect, useState } from "react";
import axios from "axios";
import MiniCalendar from "components/calendar/MiniCalendar";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
import TotalSpent from "views/admin/default/components/TotalSpent";
import PieChartCard from "views/admin/default/components/PieChartCard";
import { IoMdHome } from "react-icons/io";
import { IoDocuments } from "react-icons/io5";
import { MdBarChart, MdDashboard } from "react-icons/md";

import { columnsDataCheck, columnsDataComplex } from "./variables/columnsData";

import Widget from "components/widget/Widget";
import CheckTable from "views/admin/default/components/CheckTable";
import ComplexTable from "views/admin/default/components/ComplexTable";
import DailyTraffic from "views/admin/default/components/DailyTraffic";
import TaskCard from "views/admin/default/components/TaskCard";

import { withAuthContext } from "context/Auth";
import { withSaleContext } from "context/Sale";
import { withUserContext } from "context/User";
import { withProductContext } from "context/Product";

// Rough status -> completion percentage mapping, only used to feed the
// generic CheckTable/ComplexTable "PROGRESS" column with something more
// meaningful than a static demo number.
const STATUS_PROGRESS = {
  Pending: 20,
  Processing: 45,
  Shipped: 75,
  Delivered: 100,
  Cancelled: 0,
};

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

function orderLabel(sale) {
  return (
    sale?.Address?.full_name ||
    sale?.User?.name ||
    `Order #${String(sale?._id || "").slice(-6)}`
  );
}

const Dashboard = ({
  Token,
  AllSale,
  GetAllSale,
  AllUser,
  GetAllUser,
  AllProduct,
  GetAllProduct,
}) => {
  // Phase A4b (best-effort, optional): try the dedicated aggregation
  // endpoint if the backend happens to already have it. If it 404s, errors,
  // or simply isn't there yet, `stats` stays null and every figure below
  // falls back to the Phase A4a client-side aggregation from AllSale -
  // that fallback is the reliable path this phase does not depend on.
  const [stats, setStats] = useState(null);

  useEffect(() => {
    GetAllSale();
    GetAllUser();
    GetAllProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const token = Token || localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${process.env.REACT_APP_PUBLIC_PATH}/Dashboard-Stats`, {
        headers: { Authorization: `${token}` },
      })
      .then((res) => {
        if (res?.data?.status == 200) {
          setStats(res?.data?.data || null);
        } else {
          setStats(null);
        }
      })
      .catch(() => {
        // Endpoint not implemented yet (404) or errored - silently fall
        // back to client-side aggregation, this is expected today.
        setStats(null);
      });
  }, [Token]);

  const sales = AllSale || [];

  const totalRevenue =
    stats?.totalRevenue ??
    sales.reduce(
      (sum, s) => sum + (Number(s?.totalAmountAfterDiscount ?? s?.totalAmount) || 0),
      0
    );

  const totalOrders = stats?.totalOrders ?? sales.length;

  const ordersByStatus =
    stats?.ordersByStatus ??
    sales.reduce((acc, s) => {
      const key = s?.status || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const recentOrders = stats?.recentOrders ?? sales.slice(0, 10);

  const checkTableData = recentOrders.map((s) => ({
    name: [orderLabel(s), true],
    quantity: s?.Product?.length || 0,
    date: formatDate(s?.created_at),
    progress: STATUS_PROGRESS[s?.status] ?? 0,
  }));

  const complexTableData = recentOrders.map((s) => ({
    name: orderLabel(s),
    status: s?.status || "Unknown",
    date: formatDate(s?.created_at),
    progress: STATUS_PROGRESS[s?.status] ?? 0,
  }));

  return (
    <div>
      {/* Card widget */}

      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Total Revenue"}
          subtitle={`$${Number(totalRevenue).toFixed(2)}`}
        />
        <Widget
          icon={<IoDocuments className="h-6 w-6" />}
          title={"Total Orders"}
          subtitle={`${totalOrders}`}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Pending Orders"}
          subtitle={`${ordersByStatus?.Pending || 0}`}
        />
        <Widget
          icon={<MdDashboard className="h-6 w-6" />}
          title={"Delivered Orders"}
          subtitle={`${ordersByStatus?.Delivered || 0}`}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Total Users"}
          subtitle={`${(AllUser || []).length}`}
        />
        <Widget
          icon={<IoMdHome className="h-6 w-6" />}
          title={"Total Products"}
          subtitle={`${(AllProduct || []).length}`}
        />
      </div>

      {/* Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <TotalSpent />
        <WeeklyRevenue />
      </div>

      {/* Tables & Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Check Table */}
        <div>
          <CheckTable columnsData={columnsDataCheck} tableData={checkTableData} />
        </div>

        {/* Traffic chart & Pie Chart */}

        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <DailyTraffic />
          <PieChartCard />
        </div>

        {/* Complex Table , Task & Calendar */}

        <ComplexTable columnsData={columnsDataComplex} tableData={complexTableData} />

        {/* Task chart & Calendar */}

        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <TaskCard />
          <div className="grid grid-cols-1 rounded-[20px]">
            <MiniCalendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuthContext(
  withSaleContext(withUserContext(withProductContext(Dashboard)))
);
