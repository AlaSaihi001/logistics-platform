"use client";

import { useState, useEffect, useCallback } from "react";

interface ReportParams {
  type: string;
  period: string;
  region?: string;
  service?: string;
  startDate?: string;
  endDate?: string;
}

export function useReportData(params: ReportParams, refreshInterval?: number) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Use JSON.stringify(params) to stabilize dependency on params content, not reference
  const paramsString = JSON.stringify(params);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      const parsedParams: ReportParams = JSON.parse(paramsString);
      Object.entries(parsedParams).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `/api/admin/reports?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }

      const result = await response.json();
      setData(result.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Error fetching report data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [paramsString]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up interval for real-time updates if refreshInterval is provided
  useEffect(() => {
    if (!refreshInterval) return;

    const intervalId = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [fetchData, refreshInterval]);

  // Function to manually refresh data
  const refresh = () => {
    fetchData();
  };

  return { data, isLoading, error, lastUpdated, refresh };
}
