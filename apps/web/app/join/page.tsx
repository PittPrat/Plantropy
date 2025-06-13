// /app/join/page.tsx
'use client';

import React from 'react';
import JoinTripForm from '@/components/trip/JoinTripForm';

const JoinPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Join a Trip</h1>
        <p className="text-muted-foreground">
          Enter the join code shared by your trip organizer to get started
        </p>
      </div>
      <JoinTripForm />
    </div>
  );
};

export default JoinPage;
