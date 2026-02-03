import { leadStages } from "@/data/leads";

export const getStageColor = (status: string): string => {
  const stageMapping: Record<string, string> = {
    new: "#4CAF50",
    contacted: "#2196F3",
    qualified: "#FF9800",
    proposal: "#9C27B0",
    negotiation: "#FF5722",
    closed_won: "#4CAF50",
    closed_lost: "#F44336",
  };
  return stageMapping[status] || "#666666";
};

export const getStageLabel = (status: string): string => {
  const labelMapping: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal: "Proposal",
    negotiation: "Negotiation",
    closed_won: "Won",
    closed_lost: "Lost",
  };
  return labelMapping[status] || status;
};

export const getPriorityIcon = (priority: string): string => {
  switch (priority) {
    case "high":
      return "flag";
    case "medium":
      return "flag-outline";
    case "low":
      return "flag-sharp";
    default:
      return "flag";
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "high":
      return "#F44336";
    case "medium":
      return "#FF9800";
    case "low":
      return "#4CAF50";
    default:
      return "#666666";
  }
};

export const getPriorityLabel = (priority: string): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

export const getPriorityDisplayLabel = (priority: string): string => {
  return getPriorityLabel(priority);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

export const calculateDaysToClose = (dateString?: string): number | null => {
  if (!dateString) return null;

  const today = new Date();
  const closeDate = new Date(dateString);

  if (isNaN(closeDate.getTime())) return null;

  const diffTime = closeDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return "Not set";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getStageStats = (stats: any, leadsData: any[], colors: any) => {
  if (!stats) return [];

  const allStages = [
    { id: "0", label: "All", status: "all", color: colors.primary },
    ...leadStages.map((stage) => ({
      // ❌ LINE 96 - ERROR HERE
      ...stage,
      status: (stage as any).status || stage.label.toLowerCase(),
    })),
  ];

  return allStages.map((stage) => {
    let count = 0;
    let totalValue = 0;

    if (stage.status === "all") {
      count = stats?.totalLeads || leadsData.length;
      totalValue = leadsData.reduce((sum, lead) => sum + (lead.budget || 0), 0);
    } else {
      const stageData = stats?.leadsByStatus?.find(
        (s: any) => s._id === stage.status,
      );
      count = stageData?.count || 0;

      totalValue = leadsData
        .filter((lead) => lead.status === stage.status)
        .reduce((sum, lead) => sum + (lead.budget || 0), 0);
    }

    return {
      ...stage,
      count,
      totalValue,
    };
  });
};
