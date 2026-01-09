import api from "./index";

/* 🔴 MUST BE EXPORTED */
export interface LeadPayload {
  name: string;
  phone: string;
  status: string;
}

/* 🔴 MUST BE EXPORTED */
export const createLead = async (payload: LeadPayload) => {
  const response = await api.post("/leads", payload);
  return response.data;
};
