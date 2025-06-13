// /app/create-trip/page.tsx
'use client';

import React from 'react';
import CreateTripForm from '@/components/trip/CreateTripForm';

const CreateTripPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create a New Trip</h1>
        <p className="text-muted-foreground">
          Start planning your next adventure and invite friends to join
        </p>
      </div>
      <CreateTripForm />
    </div>
  );
};

export default CreateTripPage;
