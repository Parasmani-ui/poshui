import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-60">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-lg text-gray-300">Please wait...</p>
    </div>
  );
} 