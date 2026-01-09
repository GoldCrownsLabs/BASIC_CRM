import NetInfo from "@react-native-community/netinfo";

import { createLead, type LeadPayload } from "@/lib/api/leads.api";
import { LeadRepo } from "@/services/repositories/lead.repo";

let isSyncing = false;

export const startSyncListener = () => {
  NetInfo.addEventListener(async state => {
    if (!state.isConnected || isSyncing) return;

    isSyncing = true;

    try {
      const pendingLeads = LeadRepo.getUnsynced();

      for (const lead of pendingLeads) {
        const payload: LeadPayload = {
          name: lead.name,
          phone: lead.phone,
          status: lead.status,
        };

        await createLead(payload);
        LeadRepo.markSynced(lead.id);
      }
    } catch (error) {
      console.log("❌ Lead sync failed", error);
    } finally {
      isSyncing = false;
    }
  });
};
