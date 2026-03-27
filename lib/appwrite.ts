// lib/appwrite.ts
import { Client, Account } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("69c65cc10016c2632dcb");

export const account = new Account(client);

// ✅ Helper function to create session after Google auth
export const createAppwriteSession = async (userId: string) => {
  try {
    // Create a session using user ID
    // Note: You'll need to implement a custom JWT or session creation
    // For now, we'll just store user info
    return await account.get();
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
};
