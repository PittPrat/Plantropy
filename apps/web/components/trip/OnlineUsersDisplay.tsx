// /apps/web/components/trip/OnlineUsersDisplay.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { fetchDisplayNamesFromProfiles } from '@/lib/userUtils';

interface OnlineUsersDisplayProps {
  onlineUserIds: string[];
}

const OnlineUsersDisplay: React.FC<OnlineUsersDisplayProps> = ({ onlineUserIds }) => {
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (onlineUserIds.length > 0) {
      setIsLoading(true);
      fetchDisplayNamesFromProfiles(onlineUserIds)
        .then((names: Record<string, string>) => {
          setDisplayNames(names);
        })
        .catch((error: any) => { // Using 'any' for simplicity, can be refined if specific error types are known
          console.error('Error fetching display names for online users:', error);
          // Set fallback names if fetch fails
          const fallbackNames = onlineUserIds.reduce((acc, id) => {
            acc[id] = `User ${id.substring(0, 6)}`;
            return acc;
          }, {} as Record<string, string>);
          setDisplayNames(fallbackNames);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDisplayNames({}); // Clear names if no one is online
    }
  }, [onlineUserIds]);

  if (isLoading && onlineUserIds.length > 0) {
    return <p style={{ fontSize: '0.8em', color: '#555', margin: '5px 0 0 0', textAlign: 'center' }}>Loading online users...</p>;
  }

  if (onlineUserIds.length === 0) {
    return <p style={{ fontSize: '0.8em', color: '#777', margin: '5px 0 0 0', textAlign: 'center' }}>No users currently online.</p>;
  }

  return (
    <div style={{ fontSize: '0.8em', color: '#555', margin: '5px 0 0 0', textAlign: 'center' }}>
      <strong>Online ({onlineUserIds.length}):</strong>{' '}
      {onlineUserIds.map((id, index) => (
        <span key={id}>
          {displayNames[id] || `User ${id.substring(0, 6)}`}
          {index < onlineUserIds.length - 1 ? ', ' : ''}
        </span>
      ))}
    </div>
  );
};

export default OnlineUsersDisplay;
