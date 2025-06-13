import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Calendar, MessageCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to Plantropy!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered social coordination app for planning amazing trips with friends and family.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/create-trip">Create New Trip</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/join">Join Existing Trip</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Plan Better Together</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center">
              <MapPin className="h-8 w-8 mx-auto text-primary" />
              <CardTitle>Destinations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Plan trips to amazing destinations around the world
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <Users className="h-8 w-8 mx-auto text-primary" />
              <CardTitle>Group Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Coordinate with friends and family using simple join codes
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <Calendar className="h-8 w-8 mx-auto text-primary" />
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Set dates and track your trip timeline together
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <MessageCircle className="h-8 w-8 mx-auto text-primary" />
              <CardTitle>Real-time Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Stay connected with your travel group through built-in messaging
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Ready to Start Planning?</h2>
          <p className="text-muted-foreground">
            Create your first trip in minutes and start coordinating with your group.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/create-trip">Get Started</Link>
        </Button>
      </section>
    </main>
  );
}
