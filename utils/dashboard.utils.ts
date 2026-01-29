export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  else if (hour < 18) return "Good Afternoon";
  else return "Good Evening";
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const calculateConversionRate = (leadStats: any): string => {
  if (!leadStats || !leadStats.leadsByStatus) return "0.00";

  const wonLeads =
    leadStats.leadsByStatus.find((stat: any) => stat._id === "closed_won")
      ?.count || 0;

  const lostLeads =
    leadStats.leadsByStatus.find((stat: any) => stat._id === "closed_lost")
      ?.count || 0;

  const totalClosed = wonLeads + lostLeads;

  if (totalClosed === 0) return "0.00";

  const conversionRate = (wonLeads / totalClosed) * 100;
  return conversionRate.toFixed(2);
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
