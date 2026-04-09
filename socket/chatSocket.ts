// socket/chatSocket.ts

import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

let socket: Socket | null = null;

export const getSocket = async (): Promise<Socket> => {
  if (socket) return socket;

  const SOCKET_URL =
    process.env.EXPO_PUBLIC_SOCKET_URL || "http://192.168.1.17:5000";

  const token = await AsyncStorage.getItem("auth_token");

  console.log("🔌 Connecting to:", SOCKET_URL);

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000,
    auth: {
      token: token || "",
    },
  });

  return socket;
};

export const authenticateSocket = async (userData: {
  userId: string;
  name: string;
  email: string;
  role?: string;
}) => {
  const socketInstance = await getSocket();

  if (!socketInstance.connected) {
    await new Promise<void>((resolve) => {
      socketInstance.once("connect", () => resolve());
    });
  }

  console.log("🔐 Authenticating socket...");

  socketInstance.emit("authenticate", {
    userId: userData.userId,
    name: userData.name,
    email: userData.email,
    role: userData.role || "user",
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
