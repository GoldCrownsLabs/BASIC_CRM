import api from "./index";
import { AxiosResponse } from "axios";

// ============ Types ============

export interface EmailTemplate {
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
  isFavorite?: boolean;
  lastUsed?: string;
  useCount?: number;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface CreateTemplateDTO {
  name: string;
  type: string;
  subject: string;
  content: string;
  variables?: string[];
  customVariables?: any[];
}

export interface UpdateTemplateDTO extends Partial<CreateTemplateDTO> {
  status?: "active" | "inactive";
}

export interface SendTemplateDTO {
  leadIds: string[];
  channel: "email" | "whatsapp" | "both";
}

export interface PreviewTemplateDTO {
  subject?: string;
  content: string;
  variables?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  summary?: any;
  details?: any;
  note?: string;
}

export interface SendTemplateResponse {
  success: boolean;
  message: string;
  summary: {
    totalLeads: number;
    successfullySent: number;
    failed: number;
    channels: string;
    provider: string;
    dailyLimit: string;
    remainingToday: string;
  };
  details: {
    sent: Array<{
      email: string;
      name: string;
      messageId: string;
    }>;
    failed: Array<{
      email: string;
      name: string;
      error: string;
    }>;
  };
}

export interface VariablesHelpResponse {
  success: boolean;
  data: {
    availableVariables: Array<{
      name: string;
      description: string;
      example: string;
    }>;
    howToUse: string;
    examples: Array<{
      template: string;
      result: string;
    }>;
    note: string;
    provider: string;
  };
}

// ============ API Functions ============

/**
 * 1. Get all templates
 * GET /api/templates?type=email&status=active
 */
export const getAllTemplates = async (
  type?: string,
  status?: string,
): Promise<ApiResponse<EmailTemplate[]>> => {
  try {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (status) params.append("status", status);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    console.log(`📡 Fetching templates: /templates${queryString}`);

    const response: AxiosResponse = await api.get(`/templates${queryString}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Get all templates error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * 2. Get single template by ID
 * GET /api/templates/:id
 */
export const getTemplateById = async (
  id: string,
): Promise<ApiResponse<EmailTemplate>> => {
  try {
    console.log(`📡 Fetching template: /templates/${id}`);
    const response: AxiosResponse = await api.get(`/templates/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Get template by ID error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * 3. Create new template
 * POST /api/templates
 */
export const createTemplate = async (
  data: CreateTemplateDTO,
): Promise<ApiResponse<EmailTemplate>> => {
  try {
    console.log("📡 Creating template:", data.name);
    const response: AxiosResponse = await api.post("/templates", data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Create template error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * 4. Update template
 * PUT /api/templates/:id
 */
export const updateTemplate = async (
  id: string,
  data: UpdateTemplateDTO,
): Promise<ApiResponse<EmailTemplate>> => {
  try {
    console.log(`📡 Updating template: ${id}`);
    const response: AxiosResponse = await api.put(`/templates/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Update template error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * 5. Delete template (Admin only)
 * DELETE /api/templates/:id
 */
export const deleteTemplate = async (
  id: string,
): Promise<ApiResponse<null>> => {
  try {
    console.log(`📡 Deleting template: ${id}`);
    const response: AxiosResponse = await api.delete(`/templates/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Delete template error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * 6. Send template to leads
 * POST /api/templates/:id/send
 */
export const sendTemplateToLeads = async (
  id: string,
  data: SendTemplateDTO,
): Promise<SendTemplateResponse> => {
  try {
    console.log(`📡 Sending template ${id} to ${data.leadIds.length} leads`);
    const response: AxiosResponse = await api.post(
      `/templates/${id}/send`,
      data,
    );
    return response.data;
  } catch (error: any) {
    console.error("❌ Send template error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * 7. Preview template with sample data
 * POST /api/templates/preview
 */
export const previewTemplate = async (
  data: PreviewTemplateDTO,
): Promise<
  ApiResponse<{ subject: string; content: string; usedVariables: any }>
> => {
  try {
    console.log("📡 Previewing template");
    const response: AxiosResponse = await api.post("/templates/preview", data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Preview template error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * 8. Test email configuration
 * GET /api/templates/test-email
 */
export const testEmailConfig = async (): Promise<ApiResponse<any>> => {
  try {
    console.log("📡 Testing email configuration");
    const response: AxiosResponse = await api.get("/templates/test-email");
    return response.data;
  } catch (error: any) {
    console.error("❌ Test email error:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * 9. Get template variables help
 * GET /api/templates/variables-help
 */
export const getVariablesHelp = async (): Promise<VariablesHelpResponse> => {
  try {
    console.log("📡 Fetching variables help");
    const response: AxiosResponse = await api.get("/templates/variables-help");
    return response.data;
  } catch (error: any) {
    console.error("❌ Get variables help error:", error);
    throw error.response?.data || error.message;
  }
};

// ============ NOTE: getBrevoUsage is REMOVED - Backend doesn't have this route ============

// ============ Utility Functions ============

/**
 * Convert backend template to frontend format
 */
export const mapBackendToFrontend = (backendTemplate: EmailTemplate): any => {
  // Calculate category from subject
  const category = getCategoryFromSubject(backendTemplate.subject);

  // Get category color
  const categoryColors: Record<string, string> = {
    welcome: "#50C878",
    followup: "#FF6B6B",
    marketing: "#9B59B6",
    thankyou: "#F39C12",
    newsletter: "#3498DB",
  };

  return {
    id: backendTemplate._id,
    name: backendTemplate.name,
    subject: backendTemplate.subject,
    content: backendTemplate.content,
    description: `Template created by ${backendTemplate.createdBy?.name || "Admin"}`,
    category: category,
    categoryColor: categoryColors[category] || "#4A90E2",
    tags: backendTemplate.variables || [],
    variables: backendTemplate.variables || [],
    isFavorite: false,
    useCount: 0,
    lastUsed: backendTemplate.updatedAt
      ? new Date(backendTemplate.updatedAt).toLocaleDateString("en-IN")
      : "Never",
    createdAt: backendTemplate.createdAt,
    updatedAt: backendTemplate.updatedAt,
    status: backendTemplate.status,
    createdBy: backendTemplate.createdBy,
  };
};

/**
 * Get category based on subject/content
 */
const getCategoryFromSubject = (subject: string): string => {
  if (!subject) return "welcome";

  const subjectLower = subject.toLowerCase();

  if (subjectLower.includes("welcome") || subjectLower.includes("hello"))
    return "welcome";

  if (
    subjectLower.includes("follow") ||
    subjectLower.includes("follow-up") ||
    subjectLower.includes("checking")
  )
    return "followup";

  if (
    subjectLower.includes("offer") ||
    subjectLower.includes("promo") ||
    subjectLower.includes("discount")
  )
    return "marketing";

  if (
    subjectLower.includes("thank") ||
    subjectLower.includes("thanks") ||
    subjectLower.includes("gratitude")
  )
    return "thankyou";

  if (
    subjectLower.includes("newsletter") ||
    subjectLower.includes("update") ||
    subjectLower.includes("news")
  )
    return "newsletter";

  return "welcome"; // default
};

/**
 * Replace variables in template content
 */
export const replaceTemplateVariables = (
  content: string,
  variables: Record<string, string>,
): string => {
  if (!content) return content;

  let result = content;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, "g");
    result = result.replace(regex, value || `{${key}}`);
  });
  return result;
};

/**
 * Get template statistics from list
 */
export const getTemplateStats = (templates: any[]) => {
  return {
    total: templates.length,
    favorites: templates.filter((t) => t.isFavorite).length,
    totalUses: templates.reduce((sum, t) => sum + (t.useCount || 0), 0),
    byCategory: templates.reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {}),
  };
};

/**
 * Validate template before sending
 */
export const validateTemplate = (
  template: Partial<CreateTemplateDTO>,
): string[] => {
  const errors: string[] = [];

  if (!template.name?.trim()) errors.push("Template name is required");
  if (!template.subject?.trim()) errors.push("Email subject is required");
  if (!template.content?.trim()) errors.push("Email content is required");

  return errors;
};
