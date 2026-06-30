import PieChart from "components/charts/PieChart";
import { pieChartData, pieChartOptions } from "variables/charts";
import Card from "components/card";

const SLICE_COLORS = ["#4318FF", "#6AD2FF", "#EFF4FB", "#FFB547", "#05CD99", "#E31A1A"];

const PieChartCard = ({ revenueByCategory }) => {
  const hasData = revenueByCategory?.length > 0;

  const sorted = hasData
    ? [...revenueByCategory].sort((a, b) => (Number(b?.amount) || 0) - (Number(a?.amount) || 0))
    : null;
  const total = hasData ? sorted.reduce((sum, c) => sum + (Number(c?.amount) || 0), 0) : 0;

  const series = hasData ? sorted.map((c) => Number(c?.amount) || 0) : pieChartData;
  const options = hasData
    ? {
        ...pieChartOptions,
        labels: sorted.map((c) => c?.category),
        colors: sorted.map((_, i) => SLICE_COLORS[i % SLICE_COLORS.length]),
        fill: { colors: sorted.map((_, i) => SLICE_COLORS[i % SLICE_COLORS.length]) },
      }
    : pieChartOptions;

  const topTwo = hasData ? sorted.slice(0, 2) : null;

  return (
    <Card extra="rounded-[20px] p-3">
      <div className="flex flex-row justify-between px-3 pt-2">
        <div>
          <h4 className="text-lg font-bold text-navy-700 dark:text-white">
            Revenue by Category
          </h4>
        </div>
      </div>

      <div className="mb-auto flex h-[220px] w-full items-center justify-center">
        <PieChart options={options} series={series} />
      </div>
      <div className="flex flex-row !justify-between rounded-2xl px-6 py-3 shadow-2xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-brand-500" />
            <p className="ml-1 text-sm font-normal text-gray-600">
              {topTwo?.[0]?.category || "Your Files"}
            </p>
          </div>
          <p className="mt-px text-xl font-bold text-navy-700  dark:text-white">
            {topTwo?.[0] ? `${Math.round((Number(topTwo[0].amount) / (total || 1)) * 100)}%` : "63%"}
          </p>
        </div>

        <div className="h-11 w-px bg-gray-300 dark:bg-white/10" />

        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-[#6AD2FF]" />
            <p className="ml-1 text-sm font-normal text-gray-600">
              {topTwo?.[1]?.category || "System"}
            </p>
          </div>
          <p className="mt-px text-xl font-bold text-navy-700 dark:text-white">
            {topTwo?.[1] ? `${Math.round((Number(topTwo[1].amount) / (total || 1)) * 100)}%` : "25%"}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PieChartCard;
