// components/chat/ChatScreen.tsx - Complete Fixed Version

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth.store";
import { getSocket, authenticateSocket } from "@/socket/chatSocket";
import { chatApi } from "@/lib/api/chat.api";
import { apiService } from "@/lib/api";
import type { Socket } from "socket.io-client";

interface Message {
  messageId: string;
  text: string;
  sender: "user" | "admin" | "system";
  senderId?: string;
  senderName?: string;
  status?: "sending" | "sent" | "delivered" | "read";
  type?: "text" | "image" | "file";
  timestamp: Date;
}

interface ChatSession {
  sessionId: string;
  userInfo: {
    name: string;
    email: string;
  };
  status: "active" | "waiting" | "resolved" | "closed";
  messages: Message[];
  assignedToName?: string;
  unreadCount?: number;
}

interface ChatScreenProps {
  visible?: boolean;
  onClose?: () => void;
}

export default function ChatScreen({
  visible = true,
  onClose,
}: ChatScreenProps) {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Flags to prevent duplicate operations
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const listenersSetupRef = useRef(false);
  const initializationRef = useRef(false);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const processedStatusIds = useRef<Set<string>>(new Set());

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (socketRef.current && listenersSetupRef.current) {
      socketRef.current.off("connect");
      socketRef.current.off("disconnect");
      socketRef.current.off("connect_error");
      socketRef.current.off("chat_history");
      socketRef.current.off("new_message");
      socketRef.current.off("message_status");
      socketRef.current.off("messages_read");
      socketRef.current.off("user_typing");
      socketRef.current.off("system_message");
      socketRef.current.off("chat_assigned");
      socketRef.current.off("chat_ended");
      socketRef.current.off("error");
      listenersSetupRef.current = false;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (socketRef.current && isConnected && !sessionId) {
      console.log("⚠️ Retrying start_chat...");
      socketRef.current.emit("start_chat", {
        userId: user?.id || user?._id,
      });
    }
  }, [socketRef.current, isConnected, sessionId, user]);

  useEffect(() => {
    if (user && !isAuthLoading && !initializationRef.current) {
      console.log("👤 User loaded from AuthStore:", user);
      initializationRef.current = true;
      initializeChat(user);
    } else if (!isAuthLoading && !user) {
      console.log("❌ No user found in AuthStore");
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  // Load existing chat from REST API - FIXED: Always fetch messages separately
  const loadExistingChat = async (userId: string): Promise<boolean> => {
    try {
      setIsLoadingHistory(true);
      setFetchError(null);
      console.log("📡 ===== STARTING CHAT HISTORY LOAD =====");
      console.log("📡 User ID:", userId);
      
      // Step 1: Get list of user's chats (metadata only)
      console.log("📡 Step 1: Fetching user chat list...");
      const listResponse = await chatApi.getUserChats();
      
      console.log("📡 List Response Success:", listResponse.success);
      
      if (!listResponse.success || !listResponse.data || listResponse.data.length === 0) {
        console.log("ℹ️ No existing chats found");
        return false;
      }
      
      const chats = listResponse.data;
      console.log(`📡 Found ${chats.length} total chats`);
      
      // Log all chats found
      chats.forEach((chat, index) => {
        console.log(`📡 Chat ${index + 1}:`, {
          sessionId: chat.sessionId,
          status: chat.status,
          lastMessage: chat.lastMessage,
          lastMessageAt: chat.lastMessageAt
        });
      });
      
      // Step 2: Find active or waiting chat
      const activeChat = chats.find(
        (chat) => chat.status === "active" || chat.status === "waiting"
      );
      
      if (!activeChat) {
        console.log("ℹ️ No active or waiting chat found");
        return false;
      }
      
      console.log("✅ Found active/waiting chat:", {
        sessionId: activeChat.sessionId,
        status: activeChat.status,
        lastMessage: activeChat.lastMessage
      });
      
      // Step 3: CRITICAL - Fetch messages separately
      console.log("📡 Step 2: Fetching messages for session:", activeChat.sessionId);
      
      let sessionMessages: any[] = [];
      
      // Try endpoint 1: /chat/session/{sessionId}
      try {
        console.log(`📡 Trying: GET /chat/session/${activeChat.sessionId}`);
        const sessionResponse = await chatApi.getChatSession(activeChat.sessionId);
        
        console.log("📡 Session Response:", {
          success: sessionResponse.success,
          hasData: !!sessionResponse.data,
          messagesCount: sessionResponse.data?.messages?.length || 0
        });
        
        if (sessionResponse.success && sessionResponse.data) {
          if (sessionResponse.data.messages && Array.isArray(sessionResponse.data.messages)) {
            sessionMessages = sessionResponse.data.messages;
            console.log(`✅ Found ${sessionMessages.length} messages from session endpoint`);
          } else if (sessionResponse.data.messages === undefined) {
            console.log("⚠️ No messages field in session response, checking other fields...");
            console.log("📡 Available fields:", Object.keys(sessionResponse.data));
          }
        }
      } catch (error) {
        console.error("❌ Error fetching session:", error);
      }
      
      // Try endpoint 2: /chat/session/{sessionId}/messages if first try failed
      if (sessionMessages.length === 0) {
        try {
          console.log(`📡 Trying: GET /chat/session/${activeChat.sessionId}/messages`);
          const messagesResponse = await chatApi.getSessionMessages(activeChat.sessionId);
          
          console.log("📡 Messages Response:", {
            success: messagesResponse.success,
            messagesCount: messagesResponse.data?.length || 0
          });
          
          if (messagesResponse.success && messagesResponse.data) {
            sessionMessages = messagesResponse.data;
            console.log(`✅ Found ${sessionMessages.length} messages from messages endpoint`);
          }
        } catch (error) {
          console.error("❌ Error fetching messages:", error);
        }
      }
      
      // Try endpoint 3: Direct API call if both failed
      if (sessionMessages.length === 0) {
        try {
          console.log(`📡 Trying: Direct GET /chat/messages?sessionId=${activeChat.sessionId}`);
          const directResponse = await apiService.get(`/chat/messages`, {
            params: { sessionId: activeChat.sessionId }
          });
          
          if (directResponse.success && directResponse.data) {
            let messagesData = directResponse.data;
            if (messagesData.messages && Array.isArray(messagesData.messages)) {
              sessionMessages = messagesData.messages;
            } else if (Array.isArray(messagesData)) {
              sessionMessages = messagesData;
            }
            console.log(`✅ Found ${sessionMessages.length} messages from direct endpoint`);
          }
        } catch (error) {
          console.error("❌ Error fetching direct messages:", error);
        }
      }
      
      // Step 4: Format messages
      console.log(`📡 Formatting ${sessionMessages.length} messages...`);
      
      const formattedMessages: Message[] = sessionMessages.map((msg: any) => ({
        messageId: msg.messageId || msg._id || `msg-${Date.now()}-${Math.random()}`,
        text: msg.text || msg.content || msg.message || "",
        sender: msg.sender || (msg.senderId === userId ? "user" : "admin"),
        senderId: msg.senderId,
        senderName: msg.senderName || msg.senderName,
        status: msg.status || "sent",
        type: msg.type || "text",
        timestamp: new Date(msg.timestamp || msg.createdAt || msg.sentAt || Date.now()),
      }));
      
      console.log(`✅ Formatted ${formattedMessages.length} messages`);
      
      // Log first few messages for debugging
      if (formattedMessages.length > 0) {
        console.log("📝 First 3 messages:");
        formattedMessages.slice(0, 3).forEach((msg, idx) => {
          console.log(`  ${idx + 1}. [${msg.sender}] ${msg.text.substring(0, 50)} - ${msg.timestamp.toISOString()}`);
        });
      } else {
        console.log("ℹ️ No messages found for this chat session");
        console.log("💡 This might be a new chat with no messages yet");
      }
      
      // Step 5: Update state with loaded data
      setMessages(formattedMessages);
      setActiveSession({
        sessionId: activeChat.sessionId,
        userInfo: activeChat.userInfo,
        status: activeChat.status,
        messages: formattedMessages,
        assignedToName: activeChat.assignedToName,
        unreadCount: activeChat.unreadCount
      });
      setSessionId(activeChat.sessionId);
      
      // Clear processed IDs for this session
      processedMessageIds.current.clear();
      processedStatusIds.current.clear();
      
      // Step 6: Mark unread messages as read (if any)
      if (activeChat.unreadCount && activeChat.unreadCount > 0) {
        console.log(`📖 Marking ${activeChat.unreadCount} unread messages as read`);
        const unreadMessageIds = formattedMessages
          .filter(msg => msg.sender !== "user" && msg.status !== "read")
          .map(msg => msg.messageId);
        
        if (unreadMessageIds.length > 0) {
          try {
            await chatApi.markMessagesAsRead(activeChat.sessionId, unreadMessageIds);
            console.log("✅ Messages marked as read via API");
            
            // Update local status
            setMessages(prev =>
              prev.map(msg =>
                unreadMessageIds.includes(msg.messageId)
                  ? { ...msg, status: "read" as const }
                  : msg
              )
            );
          } catch (markError) {
            console.error("❌ Error marking messages as read:", markError);
          }
        }
      }
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      console.log("✅ Chat history loading completed successfully");
      return true;
      
    } catch (error) {
      console.error("❌ Error loading existing chat:", error);
      console.error("Error details:", error);
      setFetchError(error instanceof Error ? error.message : "Failed to load chat history");
      return false;
    } finally {
      setIsLoadingHistory(false);
      console.log("📡 ===== CHAT HISTORY LOAD COMPLETED =====\n");
    }
  };

  const initializeChat = async (userData: any) => {
    try {
      setIsLoading(true);
      console.log("🚀 Initializing chat...");
      
      // Step 1: Load existing chat from REST API first
      const userId = userData.id || userData._id;
      const hasExistingChat = await loadExistingChat(userId);
      
      // Immediately set isLoading false after REST API loads
      setIsLoading(false);
      
      // Step 2: Initialize socket for real-time updates
      console.log("🔌 Initializing socket connection...");
      const socketInstance = await getSocket();
      socketRef.current = socketInstance;

      await authenticateSocket({
        userId: userId,
        name: userData.name,
        email: userData.email,
        role: userData.role || "user",
      });

      console.log("✅ Socket authentication done");

      // Setup socket listeners only once
      if (!listenersSetupRef.current) {
        setupSocketListeners(socketInstance);
        listenersSetupRef.current = true;
      }

      // Step 3: Connect to socket for real-time updates
      socketInstance.emit("start_chat", {
        userId: userId,
      });

      console.log("🚀 start_chat emitted");
      setIsConnected(true);
      
      // If we didn't have an existing chat, wait for new session creation
      if (!hasExistingChat) {
        console.log("⏳ No existing chat, waiting for new session creation...");
      }
      
    } catch (error) {
      console.error("❌ Socket init error:", error);
      initializationRef.current = false;
      setIsLoading(false);
      Alert.alert(
        "Connection Error",
        "Failed to connect to chat. Please check your internet connection and try again.",
        [
          {
            text: "Retry",
            onPress: () => {
              initializationRef.current = false;
              initializeChat(userData);
            }
          },
          { text: "Close", style: "cancel" }
        ]
      );
    }
  };

  const setupSocketListeners = (socketInstance: Socket) => {
    socketInstance.on("connect", () => {
      console.log("✅ Socket connected, ID:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    socketInstance.on("chat_history", (session: ChatSession) => {
      console.log("📜 Chat history received via socket:", session.sessionId);
      
      // Check if we already have this session from REST API
      if (sessionId === session.sessionId) {
        console.log("ℹ️ Session already loaded from REST API, updating only new messages");
        if (session.messages && session.messages.length > messages.length) {
          const formattedMessages: Message[] = session.messages.map((msg: any) => ({
            messageId: msg.messageId,
            text: msg.text,
            sender: msg.sender,
            senderId: msg.senderId,
            senderName: msg.senderName,
            status: msg.status,
            type: msg.type || "text",
            timestamp: new Date(msg.timestamp),
          }));
          
          const newMessages = formattedMessages.filter(
            (msg) => !processedMessageIds.current.has(msg.messageId)
          );
          
          if (newMessages.length > 0) {
            newMessages.forEach(msg => processedMessageIds.current.add(msg.messageId));
            setMessages((prev) => [...prev, ...newMessages]);
          }
        }
      } else {
        console.log("🆕 New session from socket, loading completely");
        setActiveSession(session);
        setSessionId(session.sessionId);
        processedMessageIds.current.clear();
        processedStatusIds.current.clear();
        
        const formattedMessages: Message[] = (session.messages || []).map((msg: any) => ({
          messageId: msg.messageId,
          text: msg.text,
          sender: msg.sender,
          senderId: msg.senderId,
          senderName: msg.senderName,
          status: msg.status,
          type: msg.type || "text",
          timestamp: new Date(msg.timestamp),
        }));
        
        setMessages(formattedMessages);
        formattedMessages.forEach(msg => processedMessageIds.current.add(msg.messageId));
      }
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    socketInstance.on("new_message", (data: { message: Message; sessionId: string }) => {
      const messageId = data.message.messageId;

      if (processedMessageIds.current.has(messageId)) {
        console.log("⚠️ Duplicate message ignored:", messageId);
        return;
      }

      console.log("💬 New message received:", data.message.text);
      processedMessageIds.current.add(messageId);

      setMessages((prev) => {
        const tempIndex = prev.findIndex(
          (msg) =>
            msg.messageId === messageId ||
            (msg.status === "sending" &&
              msg.text === data.message.text &&
              Math.abs(
                msg.timestamp.getTime() - new Date(data.message.timestamp).getTime(),
              ) < 5000),
        );

        if (tempIndex !== -1) {
          const updatedMessages = [...prev];
          updatedMessages[tempIndex] = {
            ...data.message,
            timestamp: new Date(data.message.timestamp),
          };
          return updatedMessages;
        }

        return [
          ...prev,
          {
            ...data.message,
            timestamp: new Date(data.message.timestamp),
          },
        ];
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      if (data.message.sender === "admin" && data.message.messageId) {
        if (socketRef.current && sessionId) {
          socketRef.current.emit("mark_read", { sessionId, messageIds: [data.message.messageId] });
        }
      }

      setIsSending(false);
    });

    socketInstance.on("message_status", (data: { messageId: string; status: string }) => {
      const statusKey = `${data.messageId}-${data.status}`;

      if (processedStatusIds.current.has(statusKey)) {
        console.log("⚠️ Duplicate status ignored:", statusKey);
        return;
      }

      console.log("📨 Message status update:", data.messageId, data.status);
      processedStatusIds.current.add(statusKey);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === data.messageId
            ? { ...msg, status: data.status as any }
            : msg,
        ),
      );
    });

    socketInstance.on("messages_read", (data: { messageIds: string[]; readBy: string }) => {
      console.log("👁️ Messages marked as read by:", data.readBy);
      setMessages((prev) =>
        prev.map((msg) =>
          data.messageIds.includes(msg.messageId)
            ? { ...msg, status: "read" as const }
            : msg,
        ),
      );
    });

    socketInstance.on("user_typing", (data: { userId: string; name: string; isTyping: boolean }) => {
      setTypingUser(data.isTyping ? `${data.name} is typing...` : "");
    });

    socketInstance.on("system_message", (data: { message: string }) => {
      console.log("📢 System message:", data.message);
      const systemMsg: Message = {
        messageId: `sys-${Date.now()}-${Math.random()}`,
        text: data.message,
        sender: "system",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMsg]);
    });

    socketInstance.on("chat_assigned", (data: { assignedTo: string; message: string }) => {
      console.log("👨‍💼 Chat assigned to:", data.assignedTo);
      const systemMsg: Message = {
        messageId: `sys-${Date.now()}-${Math.random()}`,
        text: data.message,
        sender: "system",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMsg]);
      setActiveSession((prev) =>
        prev ? { ...prev, assignedToName: data.assignedTo } : prev,
      );
    });

    socketInstance.on("chat_ended", (data: { message: string }) => {
      console.log("🏁 Chat ended");
      const systemMsg: Message = {
        messageId: `sys-${Date.now()}-${Math.random()}`,
        text: data.message,
        sender: "system",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMsg]);
      setActiveSession((prev) =>
        prev ? { ...prev, status: "resolved" } : null,
      );
    });

    socketInstance.on("error", (data: { message: string }) => {
      console.error("Socket error:", data.message);
      Alert.alert("Error", data.message);
      setIsSending(false);
    });
  };

  const sendMessage = useCallback(() => {
    const messageText = input.trim();

    if (!messageText || !socketRef.current || !sessionId || isSending) {
      console.log("❌ Send blocked", {
        messageText: !!messageText,
        socket: !!socketRef.current,
        sessionId: !!sessionId,
        isSending,
      });
      return;
    }

    setIsSending(true);

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage: Message = {
      messageId: tempId,
      text: messageText,
      sender: "user",
      status: "sending",
      type: "text",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    socketRef.current.emit("send_message", {
      sessionId,
      message: messageText,
      type: "text",
      tempId,
    });

    console.log("📤 Message sent:", messageText);
    setInput("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    setTimeout(() => {
      setIsSending(false);
    }, 3000);
  }, [input, sessionId, isSending]);

  const handleTyping = useCallback(
    (text: string) => {
      setInput(text);

      if (!socketRef.current || !sessionId) return;

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socketRef.current.emit("typing_start", { sessionId });

      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("typing_end", { sessionId });
      }, 1500);
    },
    [sessionId],
  );

  const endChat = () => {
    if (!socketRef.current || !sessionId) return;
    Alert.alert("End Chat", "Are you sure you want to end this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Chat",
        style: "destructive",
        onPress: () => {
          socketRef.current?.emit("end_chat", { sessionId });
          if (onClose) onClose();
        },
      },
    ]);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string): any => {
    switch (status) {
      case "sent":
        return "check";
      case "delivered":
        return "check";
      case "read":
        return "check-circle";
      case "sending":
        return "clock";
      default:
        return "clock";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "read":
        return "#34B7F1";
      case "delivered":
        return "rgba(0,0,0,0.45)";
      case "sent":
        return "rgba(0,0,0,0.45)";
      default:
        return "rgba(0,0,0,0.45)";
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    const isSystem = item.sender === "system";

    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={styles.systemMessageWrapper}>
            <Feather name="info" size={12} color="#6B7280" />
            <Text style={styles.systemMessageText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.adminMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.adminBubble,
          ]}
        >
          {!isUser && item.senderName && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.adminText,
            ]}
          >
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isUser ? styles.userTimeText : styles.adminTimeText,
              ]}
            >
              {formatTime(item.timestamp)}
            </Text>
            {isUser && item.status && (
              <Feather
                name={getStatusIcon(item.status)}
                size={12}
                color={getStatusColor(item.status)}
                style={styles.statusIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const ChatContent = () => (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <StatusBar barStyle="light-content" backgroundColor="#075E54" />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>CRM Support Team</Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isConnected ? "#25D366" : "#FF6B6B" },
                  ]}
                />
                <Text style={styles.headerStatus}>
                  {isConnected ? typingUser || "Online" : "Connecting..."}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={endChat} style={styles.headerButton}>
              <Feather name="more-vertical" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages Area */}
        {fetchError ? (
          <View style={styles.centerContainer}>
            <Feather name="alert-circle" size={48} color="#FF6B6B" />
            <Text style={styles.errorText}>{fetchError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => user && initializeChat(user)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.messageId}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onLayout={() => flatListRef.current?.scrollToEnd()}
            ListHeaderComponent={
              isLoadingHistory && messages.length === 0 ? (
                <View style={styles.historyLoadingContainer}>
                  <ActivityIndicator size="small" color="#25D366" />
                  <Text style={styles.historyLoadingText}>Loading messages...</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              !isLoadingHistory && messages.length === 0 && !fetchError ? (
                <View style={styles.emptyContainer}>
                  <Feather name="message-circle" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyText}>
                    No messages yet. Send a message to start chatting!
                  </Text>
                </View>
              ) : null
            }
          />
        )}

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Feather name="paperclip" size={24} color="#075E54" />
            </TouchableOpacity>
            <View style={styles.textInputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={input}
                onChangeText={handleTyping}
                placeholder={sessionId ? "Type a message" : "Connecting..."}
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
                editable={!isSending && !!sessionId}
              />
            </View>
            {input.trim() ? (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  isSending && styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={isSending || !sessionId}
              >
                <Feather name="send" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.voiceButton}>
                <Feather name="mic" size={24} color="#075E54" />
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );

  if (!visible) return null;

  if (isAuthLoading) {
    return (
      <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#25D366" />
              <Text style={styles.loadingText}>Loading user data...</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (!user) {
    return (
      <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.centerContainer}>
              <View style={styles.errorCard}>
                <Feather name="lock" size={48} color="#25D366" />
                <Text style={styles.errorTitle}>Login Required</Text>
                <Text style={styles.errorText}>
                  Please login to start chatting with support
                </Text>
                {onClose && (
                  <TouchableOpacity style={styles.errorButton} onPress={onClose}>
                    <Text style={styles.errorButtonText}>Close</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <ChatContent />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "90%",
    backgroundColor: "#ECE5DD",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#075E54",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 16 : 12,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  headerStatus: {
    fontSize: 12,
    color: "#DCF8C6",
  },
  headerRight: {
    flexDirection: "row",
  },
  headerButton: {
    padding: 4,
    marginLeft: 8,
  },
  messagesList: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 2,
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  adminMessageContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  userBubble: {
    backgroundColor: "#DCF8C6",
    borderBottomRightRadius: 4,
  },
  adminBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#075E54",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: "#000000",
  },
  adminText: {
    color: "#000000",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  userTimeText: {
    color: "rgba(0,0,0,0.45)",
  },
  adminTimeText: {
    color: "#9CA3AF",
  },
  statusIcon: {
    marginLeft: 2,
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  systemMessageWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  systemMessageText: {
    fontSize: 11,
    color: "#6B7280",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F0F0F0",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    maxHeight: 100,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#000000",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#075E54",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#A5D6A5",
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    margin: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#075E54",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#075E54",
    borderRadius: 24,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 32,
  },
  historyLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  historyLoadingText: {
    fontSize: 12,
    color: "#6B7280",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#075E54",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});