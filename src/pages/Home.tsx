import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Bell, Shield } from 'lucide-react';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20 px-4">
        <div className="container mx-auto text-center space-y-6 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Discover Campus Events
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Never miss out on exciting seminars, fests, workshops, and competitions happening on campus
          </p>
          <div className="flex gap-4 justify-center pt-4">
            {currentUser ? (
              <Link to="/events">
                <Button size="lg" className="h-12 px-8 text-base">
                  Browse Events
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Get Started
                  </Button>
                </Link>
                <Link to="/events">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                    View Events
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Campus Events?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Calendar className="h-8 w-8" />}
              title="Easy Registration"
              description="Register for events with just a few clicks and manage all your registrations in one place"
            />
            <FeatureCard
              icon={<Bell className="h-8 w-8" />}
              title="Event Reminders"
              description="Never miss an event with customizable reminders and notifications"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Community Driven"
              description="Connect with fellow students and discover events that match your interests"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Trusted Platform"
              description="All events are verified and managed by approved administrators"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!currentUser && (
        <section className="py-20 px-4 bg-gradient-primary">
          <div className="container mx-auto text-center space-y-6 text-white">
            <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of students staying connected with campus events
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base mt-4">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="p-6 rounded-lg border bg-card shadow-card hover:shadow-elevated transition-all duration-300">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Home;
