// /apps/web/components/trip/MessageList.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client'; // Ensure this path is correct
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { fetchDisplayNamesFromProfiles } from '@/lib/userUtils';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_display_name?: string; // For storing fetched user display name or email
}

interface MessageListProps {
  tripId: string;
  currentUserId: string; // ID of the currently authenticated user
}

// Type guard to check if an object is a valid Message (core fields)
function isMessage(obj: any): obj is Message {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.content === 'string' &&
    typeof obj.created_at === 'string' &&
    typeof obj.user_id === 'string'
  );
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 5) {
    return 'just now';
  }
  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (days === 1) {
    return 'yesterday';
  }
  if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  // For older messages, display date, e.g., "Jun 10" or "Jun 10, 2024"
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = 'numeric';
  }
  return date.toLocaleDateString(undefined, options);
};


const MessageList: React.FC<MessageListProps> = ({ tripId, currentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial messages
  useEffect(() => {
    if (!tripId) {
        setLoading(false);
        setError("No Trip ID provided.");
        return;
    };

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('trip_messages')
          .select('id, content, created_at, user_id')
          .returns<Pick<Message, 'id' | 'content' | 'created_at' | 'user_id'>[]>()
          .eq('trip_id', tripId)
          .order('created_at', { ascending: true });

        if (fetchError) {
          console.error('Error fetching messages:', fetchError);
          setError(`Failed to load messages: ${fetchError.message}`);
        } else if (data) {
          const userIds = data.map((msg: Pick<Message, 'user_id'>) => msg.user_id);
          const displayNamesMap = await fetchDisplayNamesFromProfiles(userIds);
          const messagesWithAuthor = data.map((msg: Pick<Message, 'id' | 'content' | 'created_at' | 'user_id'>) => ({
            ...msg,
            author_display_name: displayNamesMap[msg.user_id] || msg.user_id,
          }));
          setMessages(messagesWithAuthor);
        }
      } catch (err) {
        console.error('Unexpected error fetching messages:', err);
        setError('An unexpected error occurred while loading messages.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [tripId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel(`trip-chat-${tripId}`)
      .on<Message>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trip_messages',
          filter: `trip_id=eq.${tripId}`,
        },
        async (payload: RealtimePostgresChangesPayload<Message>) => {
          const newMessageData = payload.new;

          if (!isMessage(newMessageData)) {
            console.error('Received incomplete or malformed new message payload from Realtime:', newMessageData);
            return;
          }
          // Now, newMessageData is confirmed to be of type Message (at least the core fields)
          const displayNamesMap = await fetchDisplayNamesFromProfiles([newMessageData.user_id]);
          const finalNewMessage: Message = {
            id: newMessageData.id,
            content: newMessageData.content,
            created_at: newMessageData.created_at,
            user_id: newMessageData.user_id,
            author_display_name: displayNamesMap[newMessageData.user_id] || `User ${newMessageData.user_id.substring(0,6)}`, // Fallback for display name
          };
          setMessages((prevMessages) => [...prevMessages, finalNewMessage]);
        }
      )
      .subscribe((status: `${`${"SUBSCRIBED" | "CLOSED" | "CHANNEL_ERROR" | "TIMED_OUT"}`}`, err?: Error) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to real-time messages for trip ${tripId}`);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Realtime subscription error for trip ${tripId}:`, err || status);
          setError(`Realtime connection issue: ${status}. Messages may not update live.`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  if (loading) return <p style={{ padding: '20px', textAlign: 'center' }}>Loading messages...</p>;
  if (error && messages.length === 0) return <p style={{ color: 'red', padding: '20px', textAlign: 'center' }}>Error: {error}</p>;

  return (
    <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '10px' }}>
      {messages.length === 0 && !loading && !error && (
        <p style={{ textAlign: 'center', color: '#777' }}>No messages yet. Start the conversation!</p>
      )}
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            alignSelf: msg.user_id === currentUserId ? 'flex-end' : 'flex-start',
            background: msg.user_id === currentUserId ? '#e1ffc7' : '#f1f0f0', // Light green for self, light grey for others
            padding: '8px 12px',
            borderRadius: '18px', // More rounded bubbles
            maxWidth: '75%',
            wordWrap: 'break-word',
            boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.85em', color: msg.user_id === currentUserId ? '#005000' : '#333' }}>
            {msg.user_id === currentUserId ? 'You' : (msg.author_display_name || `User ${msg.user_id.substring(0,6)}`)}
          </p>
          <p style={{ margin: '4px 0 0 0', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.7em', color: '#666', textAlign: msg.user_id === currentUserId ? 'right': 'left' }}>
            {formatRelativeTime(msg.created_at)}
          </p>
        </div>
      ))}
      <div ref={messagesEndRef} />
      {/* Display error below messages if messages are already loaded */}
      {error && messages.length > 0 && <p style={{ color: 'red', fontSize: '0.9em', textAlign: 'center', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default MessageList;
