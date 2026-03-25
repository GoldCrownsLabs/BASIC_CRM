// lib/api/chat.api.ts

import { apiService } from "@/lib/api";
import type { ApiResponse } from "@/lib/api";

export interface ChatMessage {
  messageId: string;
  text: string;
  sender: "user" | "admin" | "system";
  senderId?: string;
  senderName?: string;
  status: "sending" | "sent" | "delivered" | "read";
  type: "text" | "image" | "file";
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChatSession {
  _id?: string;
  sessionId: string;
  userId?: string;
  userInfo: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  status: "active" | "waiting" | "resolved" | "closed";
  assignedTo?: string;
  assignedToName?: string;
  messages: ChatMessage[];
  unreadCount: number;
  lastMessage: string;
  lastMessageSender: string;
  lastMessageAt: Date;
  startedAt: Date;
  endedAt?: Date;
  resolvedAt?: Date;
  rating?: {
    score: number;
    comment: string;
    givenAt: Date;
  };
}

export interface ChatStatistics {
  totalChats: { count: number }[];
  activeChats: { count: number }[];
  waitingChats: { count: number }[];
  resolvedToday: { count: number }[];
  averageResponseTime: { avgTime: number }[];
}

class ChatApiService {
  private readonly baseUrl = "/chat";

  /**
   * Get user's chat history (metadata only, no messages)
   */
  async getUserChats(): Promise<ApiResponse<ChatSession[]>> {
    try {
      console.log("📞 GET /chat/my-chats");
      const response = await apiService.get(`${this.baseUrl}/my-chats`);

      console.log("📞 Raw API Response:", response);

      // Handle different response structures
      let chatData = response.data;
      if (chatData && chatData.data && Array.isArray(chatData.data)) {
        chatData = chatData.data;
      } else if (chatData && !Array.isArray(chatData) && chatData.chats) {
        chatData = chatData.chats;
      }

      console.log(
        `📞 Found ${Array.isArray(chatData) ? chatData.length : 0} chats`,
      );

      return {
        success: response.success,
        data: Array.isArray(chatData) ? chatData : [],
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error fetching user chats:", error);
      throw error;
    }
  }

  /**
   * Get specific chat session with full messages
   */
  async getChatSession(sessionId: string): Promise<ApiResponse<ChatSession>> {
    try {
      console.log(`📞 GET /chat/session/${sessionId}`);
      const response = await apiService.get(
        `${this.baseUrl}/session/${sessionId}`,
      );

      console.log(`📞 Session response for ${sessionId}:`, response);

      // Handle nested data
      let sessionData = response.data;
      if (sessionData && sessionData.data) {
        sessionData = sessionData.data;
      }

      console.log(
        `📞 Session messages count: ${sessionData?.messages?.length || 0}`,
      );

      return {
        success: response.success,
        data: sessionData,
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error fetching chat session:", error);
      throw error;
    }
  }

  /**
   * Get messages for a specific session (alternative endpoint)
   */
  async getSessionMessages(
    sessionId: string,
  ): Promise<ApiResponse<ChatMessage[]>> {
    try {
      console.log(`📞 GET /chat/session/${sessionId}/messages`);
      const response = await apiService.get(
        `${this.baseUrl}/session/${sessionId}/messages`,
      );

      let messagesData = response.data;
      if (
        messagesData &&
        messagesData.data &&
        Array.isArray(messagesData.data)
      ) {
        messagesData = messagesData.data;
      } else if (
        messagesData &&
        !Array.isArray(messagesData) &&
        messagesData.messages
      ) {
        messagesData = messagesData.messages;
      }

      return {
        success: response.success,
        data: Array.isArray(messagesData) ? messagesData : [],
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error fetching session messages:", error);
      throw error;
    }
  }

  /**
   * Get all active chats (admin only)
   */
  async getActiveChats(): Promise<ApiResponse<ChatSession[]>> {
    try {
      const response = await apiService.get(`${this.baseUrl}/admin/active`);
      return {
        success: response.success,
        data: response.data?.data || response.data,
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error fetching active chats:", error);
      throw error;
    }
  }

  /**
   * Get chat statistics (admin only)
   */
  async getChatStatistics(): Promise<ApiResponse<ChatStatistics>> {
    try {
      const response = await apiService.get(`${this.baseUrl}/admin/statistics`);
      return {
        success: response.success,
        data: response.data?.data || response.data,
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error fetching chat statistics:", error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(
    sessionId: string,
    messageIds: string[],
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.post(
        `${this.baseUrl}/session/${sessionId}/mark-read`,
        {
          messageIds,
        },
      );
      return {
        success: response.success,
        data: response.data,
        message: response.message,
        status: response.status,
      };
    } catch (error: any) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  }
}

export const chatApi = new ChatApiService();
