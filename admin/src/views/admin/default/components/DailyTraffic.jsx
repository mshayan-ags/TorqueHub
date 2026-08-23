import BarChart from "components/charts/BarChart";
import { barChartDataDailyTraffic } from "variables/charts";
import { barChartOptionsDailyTraffic } from "variables/charts";
import { MdArrowDropUp } from "react-icons/md";
import Card from "components/card";

function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Relabeled "Orders" — there's no real visitor/traffic analytics concept in
// this app, but /Dashboard-Stats already computes a daily order count that
// fits the same "small bar chart + big number" shape.
const DailyTraffic = ({ ordersByDay }) => {
  const hasData = ordersByDay?.length > 0;
  const totalRecentOrders = hasData
    ? ordersByDay.reduce((sum, d) => sum + (Number(d?.count) || 0), 0)
    : null;

  const chartData = hasData
    ? [{ name: "Orders", data: ordersByDay.map((d) => Number(d?.count) || 0) }]
    : barChartDataDailyTraffic;

  const chartOptions = hasData
    ? {
        ...barChartOptionsDailyTraffic,
        xaxis: {
          ...barChartOptionsDailyTraffic.xaxis,
          categories: ordersByDay.map((d) => formatShortDate(d?.date)),
        },
      }
    : barChartOptionsDailyTraffic;

  return (
    <Card extra="pb-7 p-[20px]">
      <div className="flex flex-row justify-between">
        <div className="ml-1 pt-2">
          <p className="text-sm font-medium leading-4 text-gray-600">
            Orders (last 14 days)
          </p>
          <p className="text-[34px] font-bold text-navy-700 dark:text-white">
            {totalRecentOrders != null ? totalRecentOrders : "2,579"}{" "}
            <span className="text-sm font-medium leading-6 text-gray-600">
              Orders
            </span>
          </p>
        </div>
        {!hasData && (
          <div className="mt-2 flex items-start">
            <div className="flex items-center text-sm text-green-500">
              <MdArrowDropUp className="h-5 w-5" />
              <p className="font-bold"> +2.45% </p>
            </div>
          </div>
        )}
      </div>

      <div className="h-[300px] w-full pt-10 pb-0">
        <BarChart
          chartData={chartData}
          chartOptions={chartOptions}
        />
      </div>
    </Card>
  );
};

export default DailyTraffic;
