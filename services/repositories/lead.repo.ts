import { db } from "@/database/database";
import { Lead } from "@/models/lead.model";

export const LeadRepo = {
  getUnsynced(): Lead[] {
    const rows = db.getAllSync(
      "SELECT * FROM leads WHERE is_synced = 0"
    );

    // 🔴 THIS LINE FIXES THE ISSUE
    return rows as Lead[];
  },

  markSynced(id: number) {
    db.runSync(
      "UPDATE leads SET is_synced = 1 WHERE id = ?",
      [id]
    );
  }
};
