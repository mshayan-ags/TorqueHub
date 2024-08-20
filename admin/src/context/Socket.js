import React, { createContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { withAuthContext } from "./Auth";

export const SocketContext = createContext();

export const withSocketContext = (Component) => (props) =>
  (
    <SocketContext.Consumer>
      {(value) => <Component {...value} {...props} />}
    </SocketContext.Consumer>
  );

const SocketProvider = ({ children, Token }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = Token || localStorage.getItem("token");
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(process.env.REACT_APP_PUBLIC_PATH, {
      auth: { token },
    });
    socketRef.current = socket;

    // Admin sockets are auto-joined to the "admins" room server-side once
    // the handshake JWT resolves to an admin - no explicit join needed here.
    socket.on("new-sale", (payload) => {
      const notification = {
        id: payload?.id || payload?._id || `${Date.now()}`,
        totalAmount: payload?.totalAmount,
        status: payload?.status,
        receivedAt: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [Token]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default withAuthContext(SocketProvider);
