'use client';

import React from 'react';
import Image from 'next/image';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onStartSimulation: () => void;
}

export default function LandingPage({ onStartSimulation }: LandingPageProps) {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 flex flex-col p-4 border-r border-gray-700">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className={`w-24 h-24 relative ${styles.transition} ${styles.scaleOnHover}`}>
            <Image 
              src="/img.png" 
              alt="POSH Training Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        {/* New Case Button */}
        <button 
          onClick={onStartSimulation}
          className={`group mb-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center ${styles.transition} ${styles.shadowOnHover}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${styles.transition} ${styles.rotateIcon}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Start New Case
        </button>
        
        {/* Case Tracking Section - Initially hidden */}
        <div className="flex-grow">
          {/* This will be populated when a case is active */}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-4">
          {/* Company Image */}
          <div className="mb-4 flex justify-center">
            <div className={`w-48 h-24 relative ${styles.transition} ${styles.scaleOnHover}`}>
              <Image 
                src="/img.png" 
                alt="Training Company Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          {/* Description */}
          <div className={`bg-gray-800 p-5 rounded-lg shadow-lg mb-4 ${styles.transition} ${styles.moveUpOnHover}`}>
            <h1 className="text-2xl font-bold text-white mb-3">POSH Training Simulation</h1>
            <p className="text-gray-300 mb-3 text-sm">
              This simulation is designed for HR professionals and legal advisors who want to practice investigation skills under the Prevention of Sexual Harassment (POSH) Act, 2013 in the workplace.
            </p>
            <p className="text-gray-300 mb-4 text-sm">
              In each simulation, you will be provided with a realistic case where you need to review various evidence, consult the legal reference guide, and reach a conclusion. This will help you understand the investigation process under the POSH Act.
            </p>
            
            {/* Start Button */}
            <button 
              onClick={onStartSimulation}
              className={`w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-medium ${styles.transition} ${styles.shadowOnHover} ${styles.buttonScaleOnHover}`}
            >
              Start Simulation
            </button>
          </div>
          
          {/* Rules and Guidelines */}
          <div className={`bg-gray-800 p-5 rounded-lg shadow-lg ${styles.transition} ${styles.moveUpOnHover}`}>
            <h2 className="text-xl font-bold text-white mb-3">Simulation Rules and Guidelines</h2>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li className={`flex items-start ${styles.transition} ${styles.moveRightOnHover}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 text-blue-500 flex-shrink-0 ${styles.transition}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Each simulation includes a realistic case with various evidence and perspectives.</span>
              </li>
              <li className={`flex items-start ${styles.transition} ${styles.moveRightOnHover}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 text-blue-500 flex-shrink-0 ${styles.transition}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>You should review all available evidence and consult the legal reference guide.</span>
              </li>
              <li className={`flex items-start ${styles.transition} ${styles.moveRightOnHover}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 text-blue-500 flex-shrink-0 ${styles.transition}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>In your conclusion, you will need to select the responsible party, type of misconduct, and primary motivation.</span>
              </li>
              <li className={`flex items-start ${styles.transition} ${styles.moveRightOnHover}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 text-blue-500 flex-shrink-0 ${styles.transition}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>At the end of the simulation, you will receive an analysis of your conclusion that evaluates the accuracy of your selections.</span>
              </li>
              <li className={`flex items-start ${styles.transition} ${styles.moveRightOnHover}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 text-blue-500 flex-shrink-0 ${styles.transition}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>You can practice as many cases as you want, each with different scenarios and challenges.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 