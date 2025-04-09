'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { SimulationSection, ResponsibleParty, MisconductType, PrimaryMotivation, ConclusionData, SimulationData, WitnessStatement } from '@/types';

interface SimulationProps {
  simulationText: string;
  onStartNewCase: () => void;
}

// Typing animation component for statements
const TypingAnimation = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const speed = 10; // Speed of typing (lower is faster)
  
  useEffect(() => {
    if (!text) return;
    
    let index = 0;
    setDisplayedText('');
    setIsComplete(false);
    
    const typingInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text.charAt(index));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(typingInterval);
      }
    }, speed);
    
    return () => clearInterval(typingInterval);
  }, [text]);
  
  // Show a skip button if typing is not complete
  if (!isComplete) {
    return (
      <div>
        <p className="whitespace-pre-wrap text-gray-200">{displayedText}<span className="animate-pulse">|</span></p>
        <button 
          onClick={() => setIsComplete(true)}
          className="mt-4 px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600 transition"
        >
          Skip typing
        </button>
      </div>
    );
  }
  
  // If complete, just show the text
  return <p className="whitespace-pre-wrap text-gray-200">{text}</p>;
};

export default function Simulation({ simulationText, onStartNewCase }: SimulationProps) {
  const [activeSection, setActiveSection] = useState<SimulationSection>('overview');
  const [showConclusion, setShowConclusion] = useState(false);
  const [conclusion, setConclusion] = useState<ConclusionData>({
    responsibleParty: '' as ResponsibleParty,
    misconductType: '' as MisconductType,
    primaryMotivation: '' as PrimaryMotivation,
  });
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Simulation component received text:', simulationText ? simulationText.substring(0, 100) + '...' : 'empty');
    
    if (!simulationText) {
      setParseError('No simulation text provided');
      return;
    }
    
    try {
      const data = JSON.parse(simulationText) as SimulationData;
      console.log('Successfully parsed simulation data:', data);
      setSimulationData(data);
      setParseError(null);
    } catch (error) {
      console.error('Error parsing simulation data:', error);
      setParseError(`Error parsing simulation data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [simulationText]);

  const handleConcludeInvestigation = () => {
    if (!simulationData) return;
    setShowConclusion(true);
  };

  // Start New Case button
  const handleStartNewCase = () => {
    // Just call the parent handler to go back to landing page
    onStartNewCase();
  };

  // If there's a parse error, show an error message
  if (parseError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Simulation</h2>
          <p className="text-gray-300 mb-6">{parseError}</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleStartNewCase}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Start New Case
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If simulation data is not loaded yet, show loading
  if (!simulationData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Loading Simulation</h2>
          <p className="text-gray-300 mb-6">Please wait while we load your simulation...</p>
        </div>
      </div>
    );
  }

  const renderSidebar = () => (
    <div className="w-64 bg-gray-800 h-screen fixed left-0 top-0 p-4 flex flex-col">
      <div className="mb-8">
        <Image
          src="/img.png"
          alt="POSH Training Logo"
          width={150}
          height={50}
          className="mx-auto"
        />
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white mb-2">Current Case</h2>
        <p className="text-sm text-gray-300 truncate">
          {simulationData?.caseOverview.split('\n')[0]}
        </p>
        
        <div className="mt-2 bg-gray-700 p-2 rounded text-xs">
          <div className="mb-1">
            <span className="text-gray-400">Complainant:</span>{' '}
            <span className="text-white">{getCaseSpecificName('Complainant')}</span>
          </div>
          <div>
            <span className="text-gray-400">Respondent:</span>{' '}
            <span className="text-white">{getCaseSpecificName('Respondent')}</span>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Case Progress</h3>
        <nav className="space-y-1">
          <button
            onClick={() => setActiveSection('overview')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeSection === 'overview'
                ? 'bg-blue-600 text-white shadow-glow-blue'
                : 'text-gray-300 hover:bg-gray-700 hover:shadow-glow-soft'
            } transition-all duration-300`}
            disabled={showConclusion}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection('complainant')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeSection === 'complainant'
                ? 'bg-blue-600 text-white shadow-glow-blue'
                : 'text-gray-300 hover:bg-gray-700 hover:shadow-glow-soft'
            } transition-all duration-300`}
            disabled={showConclusion}
          >
            Complainant Statement
          </button>
          <button
            onClick={() => setActiveSection('respondent')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeSection === 'respondent'
                ? 'bg-blue-600 text-white shadow-glow-blue'
                : 'text-gray-300 hover:bg-gray-700 hover:shadow-glow-soft'
            } transition-all duration-300`}
            disabled={showConclusion}
          >
            Respondent Statement
          </button>
          <button
            onClick={() => setActiveSection('witnesses')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeSection === 'witnesses'
                ? 'bg-blue-600 text-white shadow-glow-blue'
                : 'text-gray-300 hover:bg-gray-700 hover:shadow-glow-soft'
            } transition-all duration-300`}
            disabled={showConclusion}
          >
            Witness Statements
          </button>
          <button
            onClick={() => setActiveSection('evidence')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeSection === 'evidence'
                ? 'bg-blue-600 text-white shadow-glow-blue'
                : 'text-gray-300 hover:bg-gray-700 hover:shadow-glow-soft'
            } transition-all duration-300`}
            disabled={showConclusion}
          >
            Evidence
          </button>
          <button
            onClick={() => setActiveSection('legal')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeSection === 'legal'
                ? 'bg-blue-600 text-white shadow-glow-blue'
                : 'text-gray-300 hover:bg-gray-700 hover:shadow-glow-soft'
            } transition-all duration-300`}
            disabled={showConclusion}
          >
            Legal Reference
          </button>
          <button
            onClick={() => setActiveSection('conclusion')}
            className={`w-full text-left px-3 py-2 rounded-md text-sm ${
              activeSection === 'conclusion'
                ? 'bg-blue-600 text-white shadow-glow-blue'
                : 'text-gray-300 hover:bg-gray-700 hover:shadow-glow-soft'
            } transition-all duration-300`}
            disabled={showConclusion}
          >
            Conclusion
          </button>
        </nav>
      </div>

      <div className="mt-auto">
        <button
          onClick={handleStartNewCase}
          className="w-full py-2 px-4 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 hover:shadow-glow-soft transition-all duration-300 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Start New Case
        </button>
      </div>
    </div>
  );

  // Function to extract party names based on contextual clues
  const getCaseSpecificName = (role: 'Complainant' | 'Respondent'): string => {
    if (!simulationData) return role;
    
    try {
      const overview = simulationData.caseOverview || '';
      console.log('Overview first 100 chars:', overview.substring(0, 100));
      
      // First try to find names in parentheses pattern
      const parenthesesPattern = new RegExp(`${role}\\s*\\(([^)]+)\\)`, 'i');
      const parenthesesMatch = overview.match(parenthesesPattern);
      if (parenthesesMatch && parenthesesMatch[1]) {
        const name = parenthesesMatch[1].trim();
        if (isValidName(name)) {
          return name;
        }
      }

      // Then try to find names after role mention
      const rolePattern = new RegExp(`${role}\\s*,\\s*([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){0,2})`, 'i');
      const roleMatch = overview.match(rolePattern);
      if (roleMatch && roleMatch[1]) {
        const name = roleMatch[1].trim();
        if (isValidName(name)) {
          return name;
        }
      }
      
      // Try common patterns that indicate a name
      const namePatterns = [
        /(\w+)\s+(?:has filed|filed|made|lodged|reported|submitted|raised|brought)\s+a\s+(?:complaint|allegation|report|case)/i,
        /(\w+)\s+(?:complained|alleged|reported|claimed|accused|stated)/i,
        /(\w+)\s+(?:is|as) the complainant/i,
        /complaint(?:[^.]*?)by\s+(\w+)/i,
        /(\w+)'s complaint/i,
        /against\s+(\w+)/i,
        /(\w+)\s+(?:denied|refuted|rejected|disputed)/i
      ];
      
      for (const pattern of namePatterns) {
        const match = overview.match(pattern);
        if (match && match[1] && isValidName(match[1])) {
          const name = match[1].trim();
          // Verify this name is associated with the correct role
          const nameContext = overview.substring(Math.max(0, match.index! - 50), Math.min(overview.length, match.index! + 50));
          if (role === 'Complainant' && nameContext.toLowerCase().includes('complainant')) {
            return name;
          }
          if (role === 'Respondent' && nameContext.toLowerCase().includes('respondent')) {
            return name;
          }
        }
      }
      
      // If we still don't have a name, try to find it in the statement
      const statement = role === 'Complainant' 
        ? simulationData.complainantStatement || '' 
        : simulationData.respondentStatement || '';
      
      // Look for name patterns in the statement
      const statementPatterns = [
        /I,\s+([A-Z][a-z]+(?: [A-Z][a-z]+){0,2})/i,
        /my name is ([A-Z][a-z]+(?: [A-Z][a-z]+){0,2})/i,
        /name is ([A-Z][a-z]+(?: [A-Z][a-z]+){0,2})/i,
        /I am ([A-Z][a-z]+(?: [A-Z][a-z]+){0,2})/i
      ];
      
      for (const pattern of statementPatterns) {
        const match = statement.match(pattern);
        if (match && match[1] && isValidName(match[1])) {
          return match[1].trim();
        }
      }
      
      // Final fallback
      return role;
    } catch (error) {
      console.error(`Error extracting ${role} name:`, error);
      return role;
    }
  };
  
  // Helper function to check if a string looks like a valid name
  const isValidName = (name: string): boolean => {
    // Check if it's a reasonable length for a name
    if (name.length < 2 || name.length > 30) return false;
    
    // Check if it contains invalid text that indicates it's not a name
    const invalidTerms = ['aware', 'policy', 'tolera', 'harass', 'statement', 'evidence', 
                          'report', 'case', 'file', 'defendant', 'plaintiff', 'complaint',
                          'be', 'the', 'and', 'or', 'but', 'if', 'in', 'on', 'at', 'to'];
    
    for (const term of invalidTerms) {
      if (name.toLowerCase() === term) return false;
    }
    
    // Check if it's a proper name (starts with capital letter)
    if (!/^[A-Z][a-z]+$/.test(name)) return false;
    
    // It's probably a valid name
    return true;
  };

  const renderMainContent = () => {
    if (showConclusion) {
      return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-white">Case Analysis</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">Responsible Party</h3>
              <div className={`p-4 rounded-lg ${
                conclusion.responsibleParty === simulationData.correctResponsibleParty
                  ? 'bg-green-800 text-green-100'
                  : 'bg-red-800 text-red-100'
              }`}>
                <p className="font-medium">Your Conclusion: {conclusion.responsibleParty}</p>
                <p className="mt-1">Correct Answer: {simulationData.correctResponsibleParty}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">Nature of Misconduct</h3>
              <div className={`p-4 rounded-lg ${
                conclusion.misconductType === simulationData.correctMisconductType
                  ? 'bg-green-800 text-green-100'
                  : 'bg-red-800 text-red-100'
              }`}>
                <p className="font-medium">Your Conclusion: {conclusion.misconductType}</p>
                <p className="mt-1">Correct Answer: {simulationData.correctMisconductType}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">Primary Motivation</h3>
              <div className={`p-4 rounded-lg ${
                conclusion.primaryMotivation === simulationData.correctPrimaryMotivation
                  ? 'bg-green-800 text-green-100'
                  : 'bg-red-800 text-red-100'
              }`}>
                <p className="font-medium">Your Conclusion: {conclusion.primaryMotivation}</p>
                <p className="mt-1">Correct Answer: {simulationData.correctPrimaryMotivation}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">Legal Analysis</h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="whitespace-pre-wrap text-gray-200">{simulationData.analysis}</p>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleStartNewCase}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Start New Case
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'conclusion') {
      return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-white">Conclude Investigation</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="responsibleParty" className="block text-sm font-medium text-gray-200 mb-2">
                Who is responsible for the misconduct?
              </label>
              <select
                id="responsibleParty"
                value={conclusion.responsibleParty}
                onChange={(e) => setConclusion({ ...conclusion, responsibleParty: e.target.value as ResponsibleParty })}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select responsible party</option>
                <option value="Respondent">Respondent</option>
                <option value="Complainant">Complainant</option>
                <option value="Both Parties">Both Parties</option>
                <option value="Neither Party">Neither Party</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="misconductType" className="block text-sm font-medium text-gray-200 mb-2">
                What is the nature of the misconduct?
              </label>
              <select
                id="misconductType"
                value={conclusion.misconductType}
                onChange={(e) => setConclusion({ ...conclusion, misconductType: e.target.value as MisconductType })}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select misconduct type</option>
                <option value="Sexual Harassment">Sexual Harassment</option>
                <option value="Discrimination">Discrimination</option>
                <option value="Retaliation">Retaliation</option>
                <option value="No Misconduct">No Misconduct</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="primaryMotivation" className="block text-sm font-medium text-gray-200 mb-2">
                What is the primary motivation behind the complaint?
              </label>
              <select
                id="primaryMotivation"
                value={conclusion.primaryMotivation}
                onChange={(e) => setConclusion({ ...conclusion, primaryMotivation: e.target.value as PrimaryMotivation })}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select primary motivation</option>
                <option value="Genuine Complaint">Genuine Complaint</option>
                <option value="Personal Vendetta">Personal Vendetta</option>
                <option value="Career Advancement">Career Advancement</option>
                <option value="Misunderstanding">Misunderstanding</option>
              </select>
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleConcludeInvestigation}
                disabled={!conclusion.responsibleParty || !conclusion.misconductType || !conclusion.primaryMotivation}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Conclusion
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Create the content map with proper type handling - using any to avoid type errors
    const getContent = () => {
      switch (activeSection) {
        case 'overview':
          return simulationData.caseOverview || '';
        case 'complainant':
          return simulationData.complainantStatement || '';
        case 'respondent':
          return simulationData.respondentStatement || '';
        case 'witnesses':
          return simulationData.witnessStatements || '';
        case 'evidence':
          return simulationData.additionalEvidence || '';
        case 'legal':
          return simulationData.legalReferenceGuide || '';
        default:
          return '';
      }
    };

    const content = getContent();

    // Function to safely render content that might be an object or a string
    const renderContent = (content: string | WitnessStatement[] | Record<string, string> | null | undefined) => {
      // Log the content to help debug
      console.log('Rendering content for section:', activeSection);
      console.log('Content type:', typeof content);
      if (typeof content !== 'string') {
        console.log('Content structure:', JSON.stringify(content).substring(0, 100));
      }

      // Apply typing animation to statement sections
      const shouldAnimate = activeSection === 'complainant' || activeSection === 'respondent';

      // Handle witness statements specifically
      if (activeSection === 'witnesses') {
        if (typeof content === 'string') {
          // Try to parse the witness statements into a more structured format
          // String format often has "Witness X - Role:" pattern followed by the statement
          const witnessMatches = content.split(/\n\s*\n/);
          
          if (witnessMatches.length > 1) {
            // Multiple witnesses found
            return (
              <div className="space-y-6">
                {witnessMatches.map((witness, index) => {
                  // Try to extract name and statement
                  const colonIndex = witness.indexOf(':');
                  const name = colonIndex > 0 ? witness.substring(0, colonIndex).trim() : `Witness ${index + 1}`;
                  const statement = colonIndex > 0 ? witness.substring(colonIndex + 1).trim() : witness;
                  
                  return (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-medium mb-2 text-white">{name}</h3>
                      <TypingAnimation text={statement} />
                    </div>
                  );
                })}
              </div>
            );
          }
          
          // Single witness or unformatted content
          return shouldAnimate ? <TypingAnimation text={content} /> : <p className="whitespace-pre-wrap text-gray-200">{content}</p>;
        }
        
        if (Array.isArray(content)) {
          return (
            <div className="space-y-6">
              {content.map((witness, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 text-white">
                    {witness.name || `Witness ${index + 1}`}
                  </h3>
                  <TypingAnimation text={witness.statement || JSON.stringify(witness)} />
                </div>
              ))}
            </div>
          );
        }
        
        if (content && typeof content === 'object') {
          return (
            <div className="space-y-6">
              {Object.entries(content).map(([name, statement], index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium mb-2 text-white">{name}</h3>
                  <TypingAnimation 
                    text={typeof statement === 'string' ? statement : JSON.stringify(statement, null, 2)} 
                  />
                </div>
              ))}
            </div>
          );
        }
        
        // If we get here, we have an unknown format
        return (
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium mb-2 text-white">Witness Statements</h3>
            <TypingAnimation 
              text={typeof content === 'string' ? content : JSON.stringify(content, null, 2)} 
            />
          </div>
        );
      }

      // Handle regular string content
      if (typeof content === 'string') {
        return shouldAnimate ? 
          <TypingAnimation text={content} /> : 
          <p className="whitespace-pre-wrap text-gray-200">{content}</p>;
      } 
      
      // If it's an array with name/statement objects
      if (Array.isArray(content)) {
        return (
          <div className="space-y-6">
            {content.map((item, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-white">{item.name || `Item ${index + 1}`}</h3>
                <p className="whitespace-pre-wrap text-gray-200">{item.statement || JSON.stringify(item)}</p>
              </div>
            ))}
          </div>
        );
      }

      // If it's a single object with name/statement
      if (content && typeof content === 'object' && ('name' in content || 'statement' in content)) {
        return (
          <div className="bg-gray-700 p-4 rounded-lg">
            {content.name && <h3 className="font-medium mb-2 text-white">{content.name}</h3>}
            {content.statement && <p className="whitespace-pre-wrap text-gray-200">{content.statement}</p>}
          </div>
        );
      }

      // If we have an object but it's not in the expected format, try to display it anyway
      if (content && typeof content === 'object') {
        return (
          <div className="space-y-6">
            {Object.entries(content).map(([key, value], index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium mb-2 text-white">{key}</h3>
                <p className="whitespace-pre-wrap text-gray-200">
                  {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                </p>
              </div>
            ))}
          </div>
        );
      }

      // Fallback - convert to string
      return <p className="whitespace-pre-wrap text-gray-200">{JSON.stringify(content, null, 2)}</p>;
    };

    // If content is missing for the selected section, show a message
    if (!content) {
      return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-white">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h2>
          <div className="prose max-w-none text-gray-200">
            <p>No {activeSection} information is available for this case.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-white">
          {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
        </h2>
        <div className="prose max-w-none text-gray-200">
          {renderContent(content)}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <style jsx global>{`
        @keyframes glow {
          0% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
          }
          100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          }
        }
        
        .shadow-glow-blue {
          animation: glow 2s infinite;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
        }
        
        .shadow-glow-soft {
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
          transition: box-shadow 0.3s ease;
        }
        
        .shadow-glow-soft:hover {
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
      `}</style>
      {renderSidebar()}
      <div className="flex-1 ml-64 p-8">
        {renderMainContent()}
      </div>
    </div>
  );
} 