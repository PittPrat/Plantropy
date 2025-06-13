// /components/trip/ShareTripCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client'; // Adjust if your client is elsewhere
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink } from 'lucide-react';

interface ShareTripCardProps {
  tripId: string;
}

const ShareTripCard: React.FC<ShareTripCardProps> = ({ tripId }) => {
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [tripName, setTripName] = useState<string | null>(null); // Optional: for context
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  useEffect(() => {
    if (!tripId) {
      setError('No Trip ID provided for sharing.');
      setLoading(false);
      return;
    }

    const fetchJoinCode = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('trips')
          .select('join_code, name') // Fetch name for context if desired
          .eq('id', tripId)
          .single();

        if (fetchError) {
          console.error('Error fetching join code:', fetchError);
          setError(`Failed to load sharing details: ${fetchError.message}`);
        } else if (data) {
          setJoinCode(data.join_code);
          setTripName(data.name);
        } else {
          setError('Trip not found, cannot get sharing details.');
        }
      } catch (err) {
        console.error('Unexpected error fetching join code:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchJoinCode();
  }, [tripId]);

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard.'); // Basic fallback
    });
  };

  if (loading) return (
    <Card>
      <CardContent className="p-6">
        <p>Loading sharing info...</p>
      </CardContent>
    </Card>
  );
  
  if (error) return (
    <Card>
      <CardContent className="p-6">
        <p className="text-destructive">Error: {error}</p>
      </CardContent>
    </Card>
  );
  
  if (!joinCode) return (
    <Card>
      <CardContent className="p-6">
        <p>Could not retrieve sharing information for this trip.</p>
      </CardContent>
    </Card>
  );

  const joinLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${joinCode}`;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Share {tripName ? `"${tripName}"` : 'this trip'}!</CardTitle>
        <CardDescription>
          Invite others to join your trip using the code or link below
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Join Code</p>
          <div className="flex space-x-2">
            <Input
              value={joinCode}
              readOnly
              className="font-mono text-lg tracking-wider uppercase text-center"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(joinCode, 'code')}
              className="px-3"
            >
              <Copy className="h-4 w-4" />
              {copied === 'code' ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Join Link</p>
          <div className="flex space-x-2">
            <Input
              value={joinLink}
              readOnly
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(joinLink, 'link')}
              className="px-3"
            >
              <Copy className="h-4 w-4" />
              {copied === 'link' ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="px-3"
            >
              <a href={joinLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareTripCard;
