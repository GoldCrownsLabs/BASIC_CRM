// components/email-templates/types.ts

export interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  description: string;
  category: string;
  categoryColor?: string;
  tags: string[];
  variables: string[];
  isFavorite: boolean;
  useCount: number;
  lastUsed: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface Stats {
  total: number;
  favorites: number;
  totalUses: number;
  dailyLimit: number;
  remainingToday: number;
}

export interface NewTemplateForm {
  name: string;
  subject: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
}

export interface ApiTemplate {
  _id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  variables: string[];
  customVariables: any[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
    companyEmail?: string;
  };
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  __v: number;
}
