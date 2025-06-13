// /app/trip/[tripId]/overview/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import TripOverviewDisplay from '@/components/trip/TripOverviewDisplay';
import ShareTripCard from '@/components/trip/ShareTripCard';
import TripChat from '@/components/trip/TripChat';

const TripOverviewPage = () => {
  const params = useParams();
  const tripId = params.tripId as string;

  return (
    <div>
      <h1>Trip Overview</h1>
      <TripOverviewDisplay tripId={tripId} />
      <ShareTripCard tripId={tripId} /> {/* TODO: Conditionally show if user just created/owns trip */}
      <div style={{ marginTop: '20px' }}>
        <TripChat tripId={tripId} />
      </div>
    </div>
  );
};

export default TripOverviewPage;
