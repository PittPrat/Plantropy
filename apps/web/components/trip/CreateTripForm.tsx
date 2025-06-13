// /components/trip/CreateTripForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Mock functions for now - these need to be implemented properly
const supabase = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: { id: '123' } } })
  },
  from: () => ({
    insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: '123' }, error: null }) }) }),
  })
};

const generateJoinCode = (length = 6): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date?: string;
  end_date?: string;
}

const CreateTripForm = () => {
  const router = useRouter();
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(''); // YYYY-MM-DD
  const [endDate, setEndDate] = useState('');   // YYYY-MM-DD
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to create a trip.');
      setIsLoading(false);
      // Optionally, redirect to login: router.push('/login');
      return;
    }

    const joinCode = generateJoinCode();

    try {
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .insert({
          name: tripName,
          destination: destination,
          start_date: startDate || null,
          end_date: endDate || null,
          join_code: joinCode,
          created_by: user.id,
        })
        .select()
        .single();

      if (tripError) {
        setError(`Failed to create trip: ${tripError.message}`);
        setIsLoading(false);
        return;
      }

      const trip = tripData as Trip;

      // Now add the creator as a member with admin role
      const { error: memberError } = await supabase
        .from('trip_members')
        .insert({
          trip_id: trip.id,
          user_id: user.id,
          role: 'admin', // Creator is admin by default
        });

      if (memberError) {
        console.error('Error adding creator as member:', memberError);
        // Don't fail the whole operation for this, but log it
        // Optionally, notify the user that they may need to manually join their own trip
      }

      router.push(`/trip/${trip.id}/overview`);
    } catch (err) {
      console.error('Unexpected error creating trip:', err);
      setError('An unexpected error occurred while creating the trip.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create New Trip</CardTitle>
        <CardDescription>
          Plan your next adventure with friends and family
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tripName">Trip Name</Label>
            <Input
              type="text"
              id="tripName"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter trip name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Where are you going?"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date (Optional)</Label>
            <Input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Trip'}
          </Button>
          
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateTripForm;
