// contexts/LeadsContext.tsx

import leadsApi, { LeadStats } from "@/lib/api/leads.api";
import React, { createContext, useState, useContext, useEffect } from "react";


interface LeadsContextType {
  totalLeads: number;
  leadStats: LeadStats | null;
  refreshLeads: () => Promise<void>;
  loading: boolean;
  leadsData: any[];
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);
  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // LeadsContext.tsx में refreshLeads function में:
  const refreshLeads = async () => {
    try {
      setLoading(true);

      // ✅ यहाँ statsResponse आ रहा है
      const statsResponse = await leadsApi.getLeadStats();
      console.log("Context - Stats Response:", statsResponse); // ✅ Debug के लिए

      if (statsResponse.success && statsResponse.data) {
        console.log("Context - totalLeads:", statsResponse.data.totalLeads); // ✅ यहाँ देखें
        setLeadStats(statsResponse.data);
        setTotalLeads(statsResponse.data.totalLeads || 0); // ✅ यहाँ set होना चाहिए
      }

      // ✅ Recent leads fetch
      const leadsResponse = await leadsApi.getLeads({
        page: 1,
        limit: 5,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (leadsResponse.success && leadsResponse.data?.data) {
        setLeadsData(leadsResponse.data.data);
      }
    } catch (error) {
      console.error("Error refreshing leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLeads();

    // Refresh every 10 minutes
    const interval = setInterval(refreshLeads, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <LeadsContext.Provider
      value={{
        totalLeads,
        leadStats,
        refreshLeads,
        loading,
        leadsData,
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
};;

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error("useLeads must be used within LeadsProvider");
  }
  return context;
};
