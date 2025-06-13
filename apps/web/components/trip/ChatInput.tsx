// /apps/web/components/trip/ChatInput.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client'; // Ensure this path is correct

interface ChatInputProps {
  tripId: string;
  userId: string; // ID of the currently authenticated user
  onMessageSent?: () => void; // Optional callback after a message is sent
}

const ChatInput: React.FC<ChatInputProps> = ({ tripId, userId, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!userId) {
      setError('You must be logged in to send messages.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('trip_messages').insert({
        trip_id: tripId,
        user_id: userId,
        content: message.trim(),
      });

      if (insertError) {
        console.error('Error sending message:', insertError);
        setError(`Failed to send message: ${insertError.message}`);
        setIsSending(false);
      } else {
        setMessage(''); // Clear input after sending
        setIsSending(false);
        if (onMessageSent) {
          onMessageSent();
        }
      }
    } catch (err) {
      console.error('Unexpected error sending message:', err);
      setError('An unexpected error occurred while sending the message.');
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', padding: '10px', borderTop: '1px solid #eee' }}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={isSending || !userId}
        style={{ flexGrow: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <button type="submit" disabled={isSending || !message.trim() || !userId} style={{ padding: '10px 15px', borderRadius: '4px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
        {isSending ? 'Sending...' : 'Send'}
      </button>
      {error && <p style={{ color: 'red', fontSize: '0.9em', margin: '5px 0 0 0' }}>{error}</p>}
      {!userId && <p style={{ color: 'orange', fontSize: '0.9em', margin: '5px 0 0 0' }}>Please log in to chat.</p>}
    </form>
  );
};

export default ChatInput;
