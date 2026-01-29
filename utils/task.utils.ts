import {
  APITask,
  Task,
  APIPriority,
  LocalPriority,
  APIStatus,
  LocalStatus,
} from "@/data/types/task";

// Helper function to map API task to local task format
export const mapApiTaskToLocal = (apiTask: APITask): Task => {
  // Determine priority mapping
  let priority: LocalPriority;
  switch (apiTask.priority) {
    case "high":
    case "urgent":
      priority = "High";
      break;
    case "medium":
      priority = "Medium";
      break;
    case "low":
    default:
      priority = "Low";
      break;
  }

  // Determine status mapping
  let status: LocalStatus;
  switch (apiTask.status) {
    case "pending":
      status = "pending";
      break;
    case "in_progress":
      status = "in_progress";
      break;
    case "completed":
      status = "completed";
      break;
    case "cancelled":
    default:
      status = "pending";
      break;
  }

  let relatedToType: "contact" | "company" | "deal" | "project" | undefined;
  let type:
    | "call"
    | "email"
    | "meeting"
    | "report"
    | "demo"
    | "follow_up"
    | "proposal"
    | "contract"
    | "payment"
    | "documentation"
    | "training"
    | "review"
    | "admin"
    | "other" = "other";

  if (apiTask.leadId || apiTask.contactId) {
    type = "call";
    relatedToType = "contact";
  }

  // Determine if task is overdue
  const dueDate = new Date(apiTask.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  if (status === "pending" && dueDate < today) {
    status = "overdue";
  }

  return {
    id: apiTask._id,
    title: apiTask.title,
    description: apiTask.description || "",
    dueDate: apiTask.dueDate.split("T")[0],
    priority,
    status,
    type,
    assignedTo: "Me",
    relatedTo: apiTask.leadId || apiTask.contactId || "",
    relatedToId: apiTask.leadId || apiTask.contactId,
    relatedToType,
    createdAt: apiTask.createdAt.split("T")[0],
    reminder: !!apiTask.reminderDate,
    reminderTime: apiTask.reminderDate || "",
    completedAt: apiTask.completedAt ? apiTask.completedAt.split("T")[0] : null,
    tags: [],
    notes: "",
    attachments: 0,
    timeEstimate: "",
    actualTimeSpent: "",
    followUpDate: "",
    location: "",
    recurrence: "none",
    createdBy: "API User",
  };
};

// Helper function to map local task to API payload
export const mapLocalTaskToApi = (localTask: Partial<Task>): any => {
  let priority: APIPriority;
  switch (localTask.priority) {
    case "High":
      priority = "high";
      break;
    case "Medium":
      priority = "medium";
      break;
    case "Low":
    default:
      priority = "low";
      break;
  }

  let reminderDate;
  if (localTask.reminder && localTask.reminderTime) {
    try {
      const reminder = new Date(localTask.reminderTime);
      if (!isNaN(reminder.getTime())) {
        reminderDate = reminder.toISOString();
      }
    } catch (error) {
      console.error("Invalid reminder date:", error);
    }
  }

  return {
    title: localTask.title!,
    description: localTask.description,
    priority,
    dueDate: new Date(localTask.dueDate!).toISOString(),
    reminderDate,
    contactId:
      localTask.relatedToType === "contact" ? localTask.relatedToId : undefined,
    leadId: undefined,
  };
};

// Priority mapping helper functions
export const mapPriorityToLocal = (apiPriority: string): LocalPriority => {
  switch (apiPriority) {
    case "high":
    case "urgent":
      return "High";
    case "medium":
      return "Medium";
    case "low":
    default:
      return "Low";
  }
};

export const mapPriorityToApi = (localPriority: LocalPriority): APIPriority => {
  switch (localPriority) {
    case "High":
      return "high";
    case "Medium":
      return "medium";
    case "Low":
      return "low";
  }
};

// Status mapping helper functions
export const mapStatusToLocal = (apiStatus: string): LocalStatus => {
  switch (apiStatus) {
    case "pending":
      return "pending";
    case "in_progress":
      return "in_progress";
    case "completed":
      return "completed";
    case "cancelled":
    default:
      return "pending";
  }
};

export const mapStatusToApi = (localStatus: LocalStatus): APIStatus => {
  switch (localStatus) {
    case "pending":
    case "overdue":
      return "pending";
    case "in_progress":
      return "in_progress";
    case "completed":
      return "completed";
  }
};

// Helper function to get status color
export const getStatusColor = (task: Task, colors: any): string => {
  switch (task.status) {
    case "completed":
      return colors.success;
    case "in_progress":
      return colors.warning;
    case "overdue":
      return colors.error;
    case "pending":
    default:
      return colors.info;
  }
};

// Helper function to get days until due
export const getDaysUntilDue = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to format task type
export const formatTaskType = (type: Task["type"]): string => {
  const typeMap: Record<Task["type"], string> = {
    call: "Call",
    email: "Email",
    meeting: "Meeting",
    report: "Report",
    demo: "Demo",
    follow_up: "Follow Up",
    proposal: "Proposal",
    contract: "Contract",
    payment: "Payment",
    documentation: "Documentation",
    training: "Training",
    review: "Review",
    admin: "Admin",
    other: "Other",
  };
  return typeMap[type] || type;
};
