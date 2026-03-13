import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000'); // Update with your actual backend URL
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Connected to Notification Socket');
    });

    const handleNewNotification = (data) => {
      const newNotif = {
        ...data,
        id: data.id || Date.now(),
        read: false,
        receivedAt: new Date(),
      };
      setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
      
      // Optional: Play sound or show toast
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`New ${data.type}`, {
          body: `From: ${data.name}${data.course ? ` for ${data.course}` : ''}`,
        });
      }
    };

    newSocket.on('newEnquiry', handleNewNotification);
    newSocket.on('newRegistration', handleNewNotification);
    newSocket.on('newContact', handleNewNotification);

    return () => newSocket.close();
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
