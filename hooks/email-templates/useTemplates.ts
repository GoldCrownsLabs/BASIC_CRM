// components/email-templates/hooks/useTemplates.ts
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  sendTemplateToLeads,
  previewTemplate,
  testEmailConfig,
  getVariablesHelp,
} from "@/lib/api/emailstemplate";
import {
  ApiTemplate,
  NewTemplateForm,
  Stats,
  Template,
} from "@/components/email-templates/emailtypes";
import {
  categoryColors,
  templateVariables,
} from "@/components/email-templates/constants";

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    favorites: 0,
    totalUses: 0,
    dailyLimit: 300,
    remainingToday: 300,
  });

  // Map backend template to frontend format
  const mapBackendToFrontend = useCallback(
    (apiTemplate: ApiTemplate): Template => {
      const category = getCategoryFromSubject(apiTemplate.subject);

      return {
        id: apiTemplate._id,
        name: apiTemplate.name,
        subject: apiTemplate.subject,
        content: apiTemplate.content,
        description: `Template created by ${apiTemplate.createdBy?.name || "Admin"}`,
        category: category,
        categoryColor: categoryColors[category] || "#4A90E2",
        tags: apiTemplate.variables || [],
        variables: apiTemplate.variables || [],
        isFavorite: false,
        useCount: 0,
        lastUsed: apiTemplate.updatedAt
          ? new Date(apiTemplate.updatedAt).toLocaleDateString("en-IN")
          : "Never",
        createdAt: apiTemplate.createdAt,
        updatedAt: apiTemplate.updatedAt,
        status: apiTemplate.status,
        createdBy: apiTemplate.createdBy,
      };
    },
    [],
  );

  // Load all templates
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllTemplates("email"); // ✅ Backend सिर्फ user के templates देगा

      if (response.success && response.data) {
        const frontendTemplates = response.data.map(mapBackendToFrontend);
        setTemplates(frontendTemplates);

        setStats((prev) => ({
          ...prev,
          total: frontendTemplates.length,
          favorites: frontendTemplates.filter((t) => t.isFavorite).length,
        }));
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load templates");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mapBackendToFrontend]);

  // ============ FIXED: Create new template ============
  const createNewTemplate = useCallback(
    async (formData: NewTemplateForm) => {
      try {
        setLoading(true);

        // ✅ STEP 1: Check which variables are used in content
        const usedDisplayVariables = templateVariables.filter((v) =>
          formData.content.includes(v),
        );

        // ✅ STEP 2: Remove curly braces for backend
        const variablesForBackend = usedDisplayVariables.map((v) =>
          v.replace(/[{}]/g, ""),
        );

        console.log("📝 Used variables in content:", {
          fromContent: usedDisplayVariables,
          toBackend: variablesForBackend,
        });

        const response = await createTemplate({
          name: formData.name,
          type: "email",
          subject: formData.subject,
          content: formData.content,
          variables: variablesForBackend, // ✅ Correct format: ["name", "company"]
        });

        if (response.success) {
          Alert.alert("Success", "Template created successfully!");
          await loadTemplates();
          return true;
        }
        return false;
      } catch (error: any) {
        console.error("❌ Create template error:", error);
        Alert.alert("Error", error.message || "Failed to create template");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loadTemplates],
  );

  // Send template to leads
  const sendTemplate = useCallback(
    async (templateId: string, leadIds: string[]) => {
      try {
        const response = await sendTemplateToLeads(templateId, {
          leadIds,
          channel: "email",
        });

        if (response.success) {
          Alert.alert(
            "Success",
            `Email sent to ${response.summary.successfullySent} leads!`,
          );
          setStats((prev) => ({
            ...prev,
            remainingToday:
              prev.remainingToday - response.summary.successfullySent,
          }));
          return true;
        }
        return false;
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to send email");
        return false;
      }
    },
    [],
  );

  // Delete template
  const deleteTemplateById = useCallback(
    async (id: string) => {
      try {
        const response = await deleteTemplate(id);
        if (response.success) {
          Alert.alert("Success", "Template deleted successfully");
          await loadTemplates();
          return true;
        }
        return false;
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to delete template");
        return false;
      }
    },
    [loadTemplates],
  );

  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    setTemplates((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, isFavorite: !t.isFavorite } : t,
      );
      setStats((s) => ({
        ...s,
        favorites: updated.filter((t) => t.isFavorite).length,
      }));
      return updated;
    });
  }, []);

  // Sort templates
  const sortByMostUsed = useCallback(() => {
    setTemplates((prev) => [...prev].sort((a, b) => b.useCount - a.useCount));
  }, []);

  // Test email
  const testEmail = useCallback(async () => {
    try {
      const response = await testEmailConfig();
      if (response.success) {
        Alert.alert("Success", "Test email sent! Check your inbox.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send test email");
    }
  }, []);

  // Preview template
  const previewTemplateContent = useCallback(async (template: Template) => {
    try {
      const response = await previewTemplate({
        subject: template.subject,
        content: template.content,
        variables: {
          name: "John Doe",
          email: "john@example.com",
          company: "ABC Corp",
        },
      });

      if (response.success) {
        Alert.alert(
          "Preview",
          `Subject: ${response.data.subject}\n\nContent: ${response.data.content}`,
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to preview template");
    }
  }, []);

  // Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    setTemplates,
    loading,
    refreshing,
    stats,
    loadTemplates,
    createNewTemplate,
    sendTemplate,
    deleteTemplateById,
    toggleFavorite,
    sortByMostUsed,
    testEmail,
    previewTemplateContent,
    onRefresh,
  };
};;

// Helper function
const getCategoryFromSubject = (subject: string): string => {
  if (!subject) return "welcome";
  const lower = subject.toLowerCase();
  if (lower.includes("welcome") || lower.includes("hello")) return "welcome";
  if (lower.includes("follow") || lower.includes("checking")) return "followup";
  if (lower.includes("offer") || lower.includes("promo")) return "marketing";
  if (lower.includes("thank")) return "thankyou";
  if (lower.includes("newsletter")) return "newsletter";
  return "welcome";
};
