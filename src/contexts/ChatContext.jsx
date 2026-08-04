import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import chatService from '../services/chatService';
import socket from '../config/socket';
import toast from 'react-hot-toast';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [incomingCall, setIncomingCall] = useState(null);

  const messagesRef = useRef([]);
  const activeContactRef = useRef(null);
  const pollMessagesRef = useRef(null);
  const pollContactsRef = useRef(null);
  const lastMessageIdRef = useRef(0);

  messagesRef.current = messages;
  activeContactRef.current = activeContact;

  const loadContacts = useCallback(async () => {
    try {
      const res = await chatService.getContacts();
      const data = res.data?.contacts || res.data || [];
      const enriched = Array.isArray(data) ? data.map(c => ({
        ...c,
        is_online: c.live_status === 'online' || c.is_online || c.online || false,
      })) : [];
      setContacts(enriched);
      const total = enriched.reduce((sum, c) => sum + (c.unread_count || 0), 0);
      setUnreadTotal(total);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  }, []);

  const selectContact = useCallback(async (userId) => {
    const contact = contacts.find(c => (c.id_utilisateur || c.id) === userId);
    setActiveContact(contact || { id_utilisateur: userId, nom: '', prenom: '' });
    setMessages([]);
    setLoading(true);
    lastMessageIdRef.current = 0;
    try {
      const res = await chatService.getMessages(userId);
      const msgs = res.data?.messages || res.data || [];
      setMessages(Array.isArray(msgs) ? msgs : []);
      if (Array.isArray(msgs) && msgs.length > 0) {
        lastMessageIdRef.current = msgs[msgs.length - 1].id_message || msgs[msgs.length - 1].id || 0;
      }
      await chatService.markRead(userId);
      loadContacts();
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }, [contacts, loadContacts]);

  const sendMessage = useCallback(async (text, file = null) => {
    if (!activeContactRef.current) return;
    const receiverId = activeContactRef.current.id_utilisateur || activeContactRef.current.id;
    try {
      let res;
      if (file) {
        const fd = new FormData();
        fd.append('receiver_id', receiverId);
        if (text) fd.append('message', text);
        fd.append('attachment', file);
        res = await chatService.sendMessage(fd);
      } else {
        res = await chatService.sendMessage({ receiver_id: receiverId, message: text });
      }
      const newMsg = res.data?.message || res.data;
      if (newMsg) {
        setMessages(prev => [...prev, newMsg]);
        if (newMsg.id_message || newMsg.id) {
          lastMessageIdRef.current = newMsg.id_message || newMsg.id;
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Erreur lors de l\'envoi du message');
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!activeContactRef.current) return;
    const userId = activeContactRef.current.id_utilisateur || activeContactRef.current.id;
    try {
      const res = await chatService.getMessages(userId, lastMessageIdRef.current);
      const older = res.data?.messages || res.data || [];
      if (Array.isArray(older) && older.length > 0) {
        setMessages(prev => [...older, ...prev]);
      }
    } catch (err) {
      console.error('Failed to load more messages:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const userId = user.id_utilisateur || user.id;

    // Rejoindre la room socket de l'utilisateur (CRITIQUE pour recevoir les events)
    const joinUserRoom = () => {
      if (socket.isConnected()) {
        socket.emit('chat-join', userId);
      }
    };
    joinUserRoom();

    // Si le socket se reconnecte, rejoindre la room à nouveau
    const s = socket.getSocket();
    if (s) {
      s.on('connect', joinUserRoom);
    }

    const handleNewMessage = (data) => {
      const senderId = data.sender_id || data.id_expediteur;
      const activeId = activeContactRef.current
        ? (activeContactRef.current.id_utilisateur || activeContactRef.current.id)
        : null;
      if (senderId === activeId) {
        setMessages(prev => {
          const exists = prev.some(m => (m.id_message || m.id) === (data.id_message || data.id));
          if (exists) return prev;
          return [...prev, data];
        });
        if (data.id_message || data.id) {
          const newId = data.id_message || data.id;
          if (newId > lastMessageIdRef.current) lastMessageIdRef.current = newId;
        }
        chatService.markRead(senderId).catch(() => {});
      } else {
        toast(`Nouveau message de ${data.sender_name || 'Quelqu\'un'}`);
      }
      loadContacts();
    };

    const handleTyping = (data) => {
      const senderId = data.user_id || data.userId;
      setTypingUsers(prev => ({ ...prev, [senderId]: true }));
      setTimeout(() => {
        setTypingUsers(prev => {
          const next = { ...prev };
          delete next[senderId];
          return next;
        });
      }, 3000);
    };

    const handleIncomingCall = (data) => {
      setIncomingCall(data);
    };

    const handleCallEnd = () => {
      setIncomingCall(null);
    };

    const handleOnlineUsersUpdate = (onlineUsersList) => {
      const onlineIds = new Set(onlineUsersList.map(u => u.userId));
      setContacts(prev => prev.map(c => ({
        ...c,
        is_online: onlineIds.has(c.id_utilisateur || c.id),
      })));
    };

    socket.on('online-users-updated', handleOnlineUsersUpdate);
    socket.on('new-message', handleNewMessage);
    socket.on('chat-typing', handleTyping);
    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-invite', handleIncomingCall);
    socket.on('call-accept', handleCallEnd);
    socket.on('call-reject', handleCallEnd);
    socket.on('call-end', handleCallEnd);

    loadContacts();

    pollMessagesRef.current = setInterval(() => {
      if (activeContactRef.current) {
        const userId = activeContactRef.current.id_utilisateur || activeContactRef.current.id;
        chatService.getMessages(userId, lastMessageIdRef.current).then(res => {
          const newer = res.data?.messages || res.data || [];
          if (Array.isArray(newer) && newer.length > 0) {
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id_message || m.id));
              const unique = newer.filter(m => !existingIds.has(m.id_message || m.id));
              if (unique.length === 0) return prev;
              const updated = [...prev, ...unique];
              const lastId = updated[updated.length - 1]?.id_message || updated[updated.length - 1]?.id || 0;
              if (lastId > lastMessageIdRef.current) lastMessageIdRef.current = lastId;
              return updated;
            });
          }
        }).catch(() => {});
      }
    }, 3000);

    pollContactsRef.current = setInterval(() => {
      loadContacts();
    }, 10000);

    return () => {
      if (s) s.off('connect', joinUserRoom);
      socket.off('online-users-updated', handleOnlineUsersUpdate);
      socket.off('new-message', handleNewMessage);
      socket.off('chat-typing', handleTyping);
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-invite', handleIncomingCall);
      socket.off('call-accept', handleCallEnd);
      socket.off('call-reject', handleCallEnd);
      socket.off('call-end', handleCallEnd);
      clearInterval(pollMessagesRef.current);
      clearInterval(pollContactsRef.current);
    };
  }, [user, loadContacts]);

  return (
    <ChatContext.Provider value={{
      contacts,
      messages,
      activeContact,
      unreadTotal,
      loading,
      sendMessage,
      selectContact,
      loadContacts,
      loadMoreMessages,
      typingUsers,
      incomingCall,
      setIncomingCall,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
