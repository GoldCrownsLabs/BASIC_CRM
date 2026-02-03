import { leadStages } from "@/data/leads";

export const getStageColor = (status: string, colors?: any): string => {
  // Use theme colors if available, otherwise default
  if (colors) {
    const colorMapping: Record<string, string> = {
      new: colors.primary || "#4CAF50",
      contacted: colors.info || "#2196F3",
      qualified: colors.warning || "#FF9800",
      proposal: colors.accent || "#9C27B0",
      negotiation: colors.purple || "#FF5722",
      closed_won: colors.success || "#4CAF50",
      closed_lost: colors.error || "#F44336",
    };
    return colorMapping[status] || colors.textSecondary || "#666666";
  }

  // Fallback to default colors
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

export const getStageStats = (stats: any, allLeadsData: any[], colors: any) => {
  // Define all possible stages (excluding "All")
  const stageDefinitions = [
    { id: "new", label: "New", status: "new" },
    { id: "contacted", label: "Contacted", status: "contacted" },
    { id: "qualified", label: "Qualified", status: "qualified" },
    { id: "proposal", label: "Proposal", status: "proposal" },
    { id: "negotiation", label: "Negotiation", status: "negotiation" },
    { id: "closed_won", label: "Won", status: "closed_won" },
    { id: "closed_lost", label: "Lost", status: "closed_lost" },
  ];

  // ALWAYS calculate from ALL leads data - counts NEVER change
  const processedStages = stageDefinitions.map((stageDef) => {
    const color = getStageColor(stageDef.status, colors);

    // Filter ALL leads for this stage
    const stageLeads = allLeadsData.filter((lead) => {
      const leadStatus = lead.status || lead.stage || "";
      return leadStatus.toLowerCase() === stageDef.status.toLowerCase();
    });

    // Calculate count and total value from ALL leads
    const count = stageLeads.length;
    const totalValue = stageLeads.reduce(
      (sum, lead) => sum + (lead.budget || lead.estimatedValue || 0),
      0,
    );

    return {
      id: stageDef.id,
      label: stageDef.label,
      status: stageDef.status,
      color,
      count, // ✅ ये count कभी नहीं बदलेगा
      totalValue, // ✅ ये value कभी नहीं बदलेगा
    };
  });

  // Return only the stages (without "All")
  return processedStages;
};

// Helper function to get "All" stage data separately
export const getAllStageData = (stages: any[]) => {
  const totalCount = stages.reduce((sum, stage) => sum + stage.count, 0);
  const totalValue = stages.reduce((sum, stage) => sum + stage.totalValue, 0);

  return {
    count: totalCount,
    value: totalValue,
  };
};
