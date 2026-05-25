import React from 'react';
import { useTrip } from './context/TripContext.jsx';
import PlanningMode from './screens/PlanningMode.jsx';
import TripMode from './screens/TripMode.jsx';

export default function App() {
  const { mode } = useTrip();
  return (
    <div className="min-h-full">
      {mode === 'planning' ? <PlanningMode /> : <TripMode />}
    </div>
  );
}
