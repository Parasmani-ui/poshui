'use client';

import { useState, useEffect } from 'react';
import Simulation from '@/components/Simulation';
import LoadingSpinner from '@/components/LoadingSpinner';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [simulationText, setSimulationText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const generateSimulation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/simulation', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate simulation');
      }
      
      const data = await response.json();
      setSimulationText(data.simulationText);
      setHasStarted(true);
    } catch (err) {
      console.error('Error generating simulation:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewCase = () => {
    setSimulationText('');
    setHasStarted(false);
    setError(null);
  };

  // Debug log to check simulation text
  useEffect(() => {
    if (hasStarted && simulationText) {
      console.log('Simulation text loaded:', simulationText.substring(0, 100) + '...');
    }
  }, [hasStarted, simulationText]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex flex-col space-y-4">
            <div className="text-gray-300 text-sm">
              <p className="mb-2">To resolve this issue:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Set the OPENAI_API_KEY environment variable</li>
              </ol>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
              >
                Go Back
              </button>
              <button
                onClick={generateSimulation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasStarted) {
    return (
      <Simulation
        simulationText={simulationText}
        onStartNewCase={handleStartNewCase}
      />
    );
  }

  return <LandingPage onStartSimulation={generateSimulation} />;
}
