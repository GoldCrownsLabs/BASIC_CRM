// components/email-templates/hooks/useTemplateForm.ts
import { NewTemplateForm } from "@/components/email-templates/emailtypes";
import { useState } from "react";


const initialForm: NewTemplateForm = {
  name: "",
  subject: "",
  category: "welcome",
  description: "",
  content: "",
  tags: [],
};

export const useTemplateForm = () => {
  const [form, setForm] = useState<NewTemplateForm>(initialForm);
  const [showVariables, setShowVariables] = useState(false);

  const updateField = (field: keyof NewTemplateForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const insertVariable = (variable: string) => {
    setForm((prev) => ({
      ...prev,
      content: prev.content + variable,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setShowVariables(false);
  };

  const validate = (): boolean => {
    return !!(form.name.trim() && form.subject.trim() && form.content.trim());
  };

  return {
    form,
    showVariables,
    setShowVariables,
    updateField,
    insertVariable,
    resetForm,
    validate,
  };
};
