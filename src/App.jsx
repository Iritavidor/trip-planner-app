import React from 'react';
import { useTrip } from './context/TripContext.jsx';
import PlanningMode from './screens/PlanningMode.jsx';
import TripMode from './screens/TripMode.jsx';
import Auth from './components/Auth.jsx';
import MyTrips from './screens/MyTrips.jsx';

export default function App() {
  const { mode, session, authLoading, guest, activeTripId } = useTrip();

  // בודקים session לפני שמחליטים מה להציג
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-muted text-sm">
        טוען…
      </div>
    );
  }

  // לא מחובר ולא בחר להמשיך כאורח — מסך התחברות
  if (!session && !guest) {
    return <Auth />;
  }

  // מחובר אך לא נבחר טיול — מסך "הטיולים שלי"
  if (session && !activeTripId) {
    return <MyTrips />;
  }

  return (
    <div className="min-h-full">
      {mode === 'planning' ? <PlanningMode /> : <TripMode />}
    </div>
  );
}
