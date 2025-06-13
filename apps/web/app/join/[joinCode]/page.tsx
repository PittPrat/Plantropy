// /app/join/[joinCode]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client'; // Adjust if your client is elsewhere
import { type User } from '@supabase/supabase-js';

interface Trip {
  id: string;
  name: string;
  destination: string | null;
  // Add other trip fields you want to display
}

const JoinByCodePage = () => {
  const params = useParams();
  const router = useRouter();
  const joinCode = params.joinCode as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyMember, setIsAlreadyMember] = useState(false);

  useEffect(() => {
    const fetchUserAndTripData = async () => {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (!joinCode) {
        setError('No join code provided.');
        setIsLoading(false);
        return;
      }

      try {
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('id, name, destination') // Select specific fields
          .eq('join_code', joinCode)
          .single();

        if (tripError) {
          setError(`Failed to fetch trip details: ${tripError.message}`);
          setTrip(null);
        } else if (!tripData) {
          setError('Trip not found. Please check the join code.');
          setTrip(null);
        } else {
          setTrip(tripData as Trip);
          // Check if user is already a member
          if (user && tripData) {
            const { data: memberData, error: memberError } = await supabase
              .from('trip_members')
              .select('user_id')
              .eq('trip_id', tripData.id)
              .eq('user_id', user.id)
              .maybeSingle(); // Use maybeSingle as user might not be a member

            if (memberError) {
              console.warn('Error checking membership:', memberError.message);
              // Don't block joining, but log it
            }
            if (memberData) {
              setIsAlreadyMember(true);
            }
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching trip data:', err);
        setError('An unexpected error occurred while fetching trip details.');
        setTrip(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndTripData();
  }, [joinCode]);

  const handleJoinTrip = async () => {
    if (!currentUser) {
      setError('You must be logged in to join a trip.');
      // Optionally, redirect to login: router.push('/login?redirect=/join/' + joinCode);
      return;
    }

    if (!trip) {
      setError('Trip details not loaded or trip not found.');
      return;
    }

    if (isAlreadyMember) {
        setError('You are already a member of this trip.');
        // Optionally redirect to trip overview if already a member
        // router.push(`/trip/${trip.id}/overview`);
        return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const { error: joinError } = await supabase
        .from('trip_members')
        .insert({
          trip_id: trip.id,
          user_id: currentUser.id,
          role: 'member', // Default role for joining via code
        });

      if (joinError) {
        if (joinError.code === '23505') { // Unique constraint violation (user_id, trip_id)
            setError('You are already a member of this trip.');
            setIsAlreadyMember(true);
        } else {
            setError(`Failed to join trip: ${joinError.message}`);
        }
      } else {
        // Successfully joined
        router.push(`/trip/${trip.id}/overview`);
      }
    } catch (err) {
      console.error('Unexpected error joining trip:', err);
      setError('An unexpected error occurred while trying to join the trip.');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return <div>Loading trip details...</div>;
  }

  return (
    <div>
      <h1>Join Trip</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {trip && !error && (
        <div>
          <h2>{trip.name}</h2>
          {trip.destination && <p>Destination: {trip.destination}</p>}
          
          {currentUser ? (
            isAlreadyMember ? (
              <div>
                <p>You are already a member of this trip.</p>
                <button onClick={() => router.push(`/trip/${trip.id}/overview`)}>
                  Go to Trip Overview
                </button>
              </div>
            ) : (
              <button onClick={handleJoinTrip} disabled={isJoining}>
                {isJoining ? 'Joining...' : 'Confirm and Join Trip'}
              </button>
            )
          ) : (
            <p>Please <a href={`/login?redirect=/join/${joinCode}`}>log in or sign up</a> to join this trip.</p>
            // Consider a more integrated login flow or component
          )}
        </div>
      )}

      {!trip && !error && !isLoading && (
        <p>Enter a valid join code to see trip details.</p>
      )}
    </div>
  );
};

export default JoinByCodePage;
