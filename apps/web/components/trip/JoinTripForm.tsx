// /components/trip/JoinTripForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const JoinTripForm = () => {
  const [joinCode, setJoinCode] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      router.push(`/join/${joinCode.trim()}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join a Trip</CardTitle>
        <CardDescription>
          Enter the join code shared by your trip organizer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="joinCode">Join Code</Label>
            <Input
              type="text"
              id="joinCode"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              required
              placeholder="Enter 6-character code"
              className="uppercase tracking-wider"
            />
          </div>
          <Button type="submit" className="w-full">
            Join with Code
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default JoinTripForm;
