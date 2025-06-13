// /apps/web/components/trip/TripChat.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { RealtimePresenceState, RealtimeChannelSendResponse } from '@supabase/supabase-js'; // Ensure this path is correct
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import OnlineUsersDisplay from './OnlineUsersDisplay';

interface TripChatProps {
  tripId: string;
}

const TripChat: React.FC<TripChatProps> = ({ tripId }) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loadingUserId, setLoadingUserId] = useState(true);
  const [errorUserId, setErrorUserId] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<RealtimePresenceState<{ user_id: string }>>({});

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUserId(true);
      setErrorUserId(null);
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching current user:', error);
          setErrorUserId(`Failed to get user session: ${error.message}`);
          setCurrentUserId(null);
        } else if (user) {
          setCurrentUserId(user.id);
        } else {
          // No user logged in, but not an error in fetching
          setCurrentUserId(null);
          // setErrorUserId('No user logged in. Please log in to chat.'); // Optional: treat as error
        }
      } catch (err) {
        console.error('Unexpected error fetching user:', err);
        setErrorUserId('An unexpected error occurred while fetching user information.');
        setCurrentUserId(null);
      } finally {
        setLoadingUserId(false);
      }
    };

    fetchUser();
  }, []);

  // Supabase Realtime Presence
  useEffect(() => {
    if (!tripId || !currentUserId) return;

    const presenceChannelName = `presence-trip-${tripId}`;
    const channel = supabase.channel(presenceChannelName, {
      config: {
        presence: {
          key: currentUserId, // Unique key for this client's presence
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState<{ user_id: string }>();
        setOnlineUsers(newState);
        console.log('Presence sync, current state:', newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string; newPresences: { user_id: string }[] }) => {
        console.log('Presence join:', key, newPresences);
        // Optionally, trigger a re-fetch or update of online users if needed beyond sync
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string; leftPresences: { user_id: string }[] }) => {
        console.log('Presence leave:', key, leftPresences);
        // Optionally, trigger a re-fetch or update of online users if needed beyond sync
      })
      .subscribe(async (status: `${`${"SUBSCRIBED" | "CLOSED" | "CHANNEL_ERROR" | "TIMED_OUT"}`}`, err?: Error) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to presence channel: ${presenceChannelName}`);
          // Track the current user's presence
          const trackStatus: RealtimeChannelSendResponse = await channel.track({ user_id: currentUserId, online_at: new Date().toISOString() });
          console.log('Track status:', trackStatus);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Error subscribing to presence channel ${presenceChannelName}:`, status);
        }
      });

    return () => {
      console.log(`Unsubscribing from presence channel: ${presenceChannelName}`);
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [tripId, currentUserId]);

  // Helper to get a flat list of online user IDs
  const getOnlineUserIds = useCallback(() => {
    return Object.values(onlineUsers).flatMap(presences => presences.map(p => p.user_id));
  }, [onlineUsers]);

  if (loadingUserId) {
    return <p style={{ padding: '20px', textAlign: 'center' }}>Loading chat session...</p>;
  }

  // Error fetching user ID is critical for chat functionality
  if (errorUserId && !currentUserId) {
    return <p style={{ color: 'red', padding: '20px', textAlign: 'center' }}>Error: {errorUserId}</p>;
  }
  
  // If no user is logged in, ChatInput will show a message, but MessageList might still load.
  // Depending on requirements, you might want to block the entire chat UI if no user.
  // For now, we allow MessageList to load (read-only view if RLS permits for unauth, or empty if not).

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', /* Adjust height as needed */ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '10px 15px', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ margin: 0, textAlign: 'center' }}>Trip Chat</h2>
        <OnlineUsersDisplay onlineUserIds={getOnlineUserIds()} />
      </div>
      {tripId && currentUserId ? (
        <>
          <MessageList tripId={tripId} currentUserId={currentUserId} />
          <ChatInput tripId={tripId} userId={currentUserId} />
        </>
      ) : (
        <div style={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
          {!currentUserId && !loadingUserId && (
             <p style={{ color: 'orange', textAlign: 'center' }}>Please log in to participate in the chat.</p>
          )}
          {/* Render ChatInput here if you want its specific "Please log in" message to show */}
          {/* Or handle the !currentUserId case more explicitly */}
        </div>
      )}
       {/* Fallback for ChatInput if user is not logged in and we want to show it outside the conditional block */}
       {!currentUserId && !loadingUserId && tripId && (
         <ChatInput tripId={tripId} userId="" /> // Pass empty userId to show its internal login prompt
       )}
    </div>
  );
};

export default TripChat;
