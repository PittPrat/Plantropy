// /components/trip/TripOverviewDisplay.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client'; // Adjust if your client is elsewhere

interface TripOverviewDisplayProps {
  tripId: string;
}

interface TripDetails {
  id: string;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  join_code: string;
  created_at: string;
  // created_by: string; //  Potentially fetch user details for creator later
}

const TripOverviewDisplay: React.FC<TripOverviewDisplayProps> = ({ tripId }) => {
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      setError('No Trip ID provided.');
      return;
    }

    const fetchTripDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('trips')
          .select('id, name, destination, start_date, end_date, join_code, created_at')
          .eq('id', tripId)
          .single();

        if (fetchError) {
          console.error('Error fetching trip details:', fetchError);
          setError(`Failed to load trip details: ${fetchError.message}`);
          setTrip(null);
        } else if (data) {
          setTrip(data as TripDetails);
        } else {
          setError('Trip not found.');
          setTrip(null);
        }
      } catch (err) {
        console.error('Unexpected error fetching trip:', err);
        setError('An unexpected error occurred while fetching trip details.');
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId]);

  if (loading) return <p>Loading trip details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!trip) return <p>Trip not found or no details available.</p>;

  return (
    <div>
      <h2>{trip.name}</h2>
      {trip.destination && <p><strong>Destination:</strong> {trip.destination}</p>}
      {trip.start_date && <p><strong>Start Date:</strong> {new Date(trip.start_date).toLocaleDateString()}</p>}
      {trip.end_date && <p><strong>End Date:</strong> {new Date(trip.end_date).toLocaleDateString()}</p>}
      <p><strong>Join Code:</strong> {trip.join_code} (Share this code to invite others!)</p>
      <p><small>Created on: {new Date(trip.created_at).toLocaleString()}</small></p>
      {/* 
        Future enhancements:
        - Display list of trip members
        - Options to edit trip (if creator)
        - Other trip-specific functionalities
      */}
    </div>
  );
};

export default TripOverviewDisplay;
