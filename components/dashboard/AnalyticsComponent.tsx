"use client";
import React, { useEffect, useState } from "react";
import IconEye from "../icon/icon-eye";
import Link from "next/link";

interface PageAnalyticsItem {
  page: string | null;
  pageViews: number;
}

interface AnalyticsData {
  totalSessions: number;
  totalPageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  pageAnalytics: PageAnalyticsItem[];
  startDate: string;
  endDate: string;
  lastWeekTotalSessions: number;
  lastWeekTotalPageViews: number;
  lastWeekBounceRate: number;
  lastWeekAvgSessionDuration: number;
  growthTotalSessions: number;
  growthTotalPageViews: number;
  growthBounceRate: number;
  growthAvgSessionDuration: number;
}

const AnalyticsComponent: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Define the date range for filtering (can be made dynamic later)
  const startDate = "2025-01-01";
  const endDate = "2025-12-31";

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}tracking/detailed-analytics?startDate=${startDate}&endDate=${endDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Convert pageViews to numbers if necessary.
          const updatedData: AnalyticsData = {
            ...data.data,
            pageAnalytics: data.data.pageAnalytics.map((item: any) => ({
              page: item.page,
              pageViews: Number(item.pageViews),
            })),
          };
          setAnalytics(updatedData);
        } else {
          setError("Failed to fetch analytics");
        }
      })
      .catch((err) => setError(err.message));
  }, [startDate, endDate]);

  if (error) return <div>Error: {error}</div>;
  if (!analytics) return <div>Loading...</div>;

  const {
    totalSessions,
    totalPageViews,
    bounceRate,
    avgSessionDuration,
    pageAnalytics,
    startDate: fetchedStart,
    endDate: fetchedEnd,
    lastWeekTotalSessions,
    lastWeekTotalPageViews,
    lastWeekBounceRate,
    lastWeekAvgSessionDuration,
    growthTotalSessions,
    growthTotalPageViews,
    growthBounceRate,
    growthAvgSessionDuration,
  } = analytics;


  // Helper function to convert duration from ms to "Xm Ys" format.
  const formatDuration = (durationMs: number) => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  // Helper function to format a date string into a more readable format.
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Convert average session durations from milliseconds to seconds
  const avgSessionSeconds = formatDuration(avgSessionDuration);
  const lastWeekAvgSessionSeconds = formatDuration(lastWeekAvgSessionDuration);

  return (
    <>
      <ul className="flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link href="/" className="text-primary hover:underline">
            Dashboard
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>Analytics</span>
        </li>
      </ul>

      <div className="panel flex-1 px-0 pb-6 ltr:xl:mr-6 rtl:xl:ml-6 pt-0">
        <div className="px-4 py-4 w-100">


          <h1 className="text-2xl font-bold mb-3">Detailed Analytics Dashboard</h1>
          <p>
            Date Range: {formatDate(fetchedStart)} to {formatDate(fetchedEnd)}
          </p>

          <div className="pt-2">
            <div className="mb-6 grid grid-cols-1 gap-6 text-white sm:grid-cols-2 xl:grid-cols-4">
              {/* Users Visit Panel */}
              <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400 p-4">
                <div className="flex justify-between">
                  <div className="text-md font-semibold">Users Visit</div>
                </div>
                <div className="mt-5 flex items-center">
                  <div className="text-3xl font-bold mr-3">{totalPageViews}</div>
                  <div className="badge bg-white/30">
                    {growthTotalPageViews > 0 ? `+${growthTotalPageViews}%` : `${growthTotalPageViews}%`}
                  </div>
                </div>
                <div className="mt-5 flex items-center font-semibold">
                  <IconEye className="shrink-0 mr-2" />
                  Last Week {lastWeekTotalPageViews.toLocaleString()}
                </div>
              </div>

              {/* Sessions Panel */}
              <div className="panel bg-gradient-to-r from-violet-500 to-violet-400 p-4">
                <div className="flex justify-between">
                  <div className="text-md font-semibold">Sessions</div>
                </div>
                <div className="mt-5 flex items-center">
                  <div className="text-3xl font-bold mr-3">{totalSessions}</div>
                  <div className="badge bg-white/30">
                    {growthTotalSessions > 0 ? `+${growthTotalSessions}%` : `${growthTotalSessions}%`}
                  </div>
                </div>
                <div className="mt-5 flex items-center font-semibold">
                  <IconEye className="shrink-0 mr-2" />
                  Last Week {lastWeekTotalSessions.toLocaleString()}
                </div>
              </div>

              {/* Avg. Session Duration Panel */}
              <div className="panel bg-gradient-to-r from-blue-500 to-blue-400 p-4">
                <div className="flex justify-between">
                  <div className="text-md font-semibold">Avg. Session Duration</div>
                </div>
                <div className="mt-5 flex items-center">
                  <div className="text-3xl font-bold mr-3">{avgSessionSeconds} sec</div>
                  <div className="badge bg-white/30">
                    {growthAvgSessionDuration > 0 ? `+${growthAvgSessionDuration}%` : `${growthAvgSessionDuration}%`}
                  </div>
                </div>
                <div className="mt-5 flex items-center font-semibold">
                  <IconEye className="shrink-0 mr-2" />
                  Last Week {lastWeekAvgSessionSeconds} sec
                </div>
              </div>

              {/* Bounce Rate Panel */}
              <div className="panel bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 p-4">
                <div className="flex justify-between">
                  <div className="text-md font-semibold">Bounce Rate</div>
                </div>
                <div className="mt-5 flex items-center">
                  <div className="text-3xl font-bold mr-3">{bounceRate.toFixed(2)}%</div>
                  <div className="badge bg-white/30">
                    {growthBounceRate > 0 ? `+${growthBounceRate}%` : `${growthBounceRate}%`}
                  </div>
                </div>
                <div className="mt-5 flex items-center font-semibold">
                  <IconEye className="shrink-0 mr-2" />
                  Last Week {lastWeekBounceRate.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">Page-Level Analytics</h2>
          <div className="table-responsive mb-5">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 text-left">Page</th>
                  <th className="border border-gray-300 p-2 text-left">Page Views</th>
                </tr>
              </thead>
              <tbody>
                {pageAnalytics.map((item, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 p-2">{item.page || "Unknown"}</td>
                    <td className="border border-gray-300 p-2">{item.pageViews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>

  );
};

export default AnalyticsComponent;
