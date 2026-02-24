// components/email-templates/constants.ts

import { Category } from "./emailtypes";


export const templateCategories: Category[] = [
  { id: "all", label: "All", icon: "grid", color: "#4A90E2" },
  { id: "welcome", label: "Welcome", icon: "user-plus", color: "#50C878" },
  { id: "followup", label: "Follow-up", icon: "repeat", color: "#FF6B6B" },
  {
    id: "marketing",
    label: "Marketing",
    icon: "trending-up",
    color: "#9B59B6",
  },
  { id: "thankyou", label: "Thank You", icon: "heart", color: "#F39C12" },
  { id: "newsletter", label: "Newsletter", icon: "mail", color: "#3498DB" },
];

export const templateVariables = [
  "{name}",
  "{email}",
  "{phone}",
  "{company}",
  "{position}",
  "{date}",
];

export const categoryColors: Record<string, string> = {
  welcome: "#50C878",
  followup: "#FF6B6B",
  marketing: "#9B59B6",
  thankyou: "#F39C12",
  newsletter: "#3498DB",
};
