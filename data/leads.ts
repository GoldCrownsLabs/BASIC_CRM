// @/data/leads.ts में existing code के बाद add करें

// Keep your original array for display
export const leadSources = [
  "Website",
  "Referral",
  "Conference",
  "LinkedIn",
  "Email Campaign",
  "Trade Show",
  "Social Media",
];

// Add lead stages array
export const leadStages = [
  { id: "1", label: "New", status: "new", color: "#4CAF50" },
  { id: "2", label: "Contacted", status: "contacted", color: "#2196F3" },
  { id: "3", label: "Qualified", status: "qualified", color: "#FF9800" },
  { id: "4", label: "Proposal", status: "proposal", color: "#9C27B0" },
  { id: "5", label: "Negotiation", status: "negotiation", color: "#FF5722" },
  { id: "6", label: "Won", status: "closed_won", color: "#4CAF50" },
  { id: "7", label: "Lost", status: "closed_lost", color: "#F44336" },
];

// Also add priorities array for PriorityFilter
export const priorities = ["high", "medium", "low"];

// Add a mapping function
export const mapSourceToBackend = (frontendSource: string): string => {
  const sourceMap: Record<string, string> = {
    Website: "website",
    website: "website",
    Referral: "referral",
    referral: "referral",
    Conference: "event",
    conference: "event",
    LinkedIn: "social_media",
    linkedin: "social_media",
    "Email Campaign": "advertisement",
    "email campaign": "advertisement",
    email: "advertisement",
    "Trade Show": "event",
    "trade show": "event",
    "Social Media": "social_media",
    "social media": "social_media",
    social: "social_media",
    Advertisement: "advertisement",
    advertisement: "advertisement",
    Event: "event",
    event: "event",
    Other: "other",
    other: "other",
  };

  return sourceMap[frontendSource] || "website";
};

// For display in UI
export const getSourceLabel = (backendSource: string): string => {
  const labelMap: Record<string, string> = {
    website: "Website",
    referral: "Referral",
    social_media: "Social Media",
    advertisement: "Advertisement",
    event: "Event",
    other: "Other",
  };

  return labelMap[backendSource] || "Website";
};
