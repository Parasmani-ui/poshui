import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { cookies } from 'next/headers';
import { decrypt } from '@/utils/encryption';
import { POSH_TRAINING_SIMULATION_PROMPT } from '@/utils/prompts';
import { SimulationData } from '@/types';



// Basic template for creating a new simulation if all else fails
const EMPTY_TEMPLATE: SimulationData = {
  caseOverview: "Workplace Incident Report\n\nThis is a placeholder for a new case. The OpenAI API was unable to generate a complete case.",
  complainantStatement: "The complainant statement could not be generated.",
  respondentStatement: "The respondent statement could not be generated.",
  witnessStatements: "Witness 1 - HR Manager:\nI witnessed the incident and can confirm that tensions have been high between the two parties. The complainant appeared visibly upset after their interaction.\n\nWitness 2 - Team Lead:\nI have observed multiple interactions between the parties and noticed a pattern of uncomfortable exchanges.",
  additionalEvidence: "Email Evidence: Email exchanges showing communications between parties.\n\nCompany Policy: Relevant workplace policy documents.",
  legalReferenceGuide: "POSH Act Legal Reference Guide:\n\n1. Definition of Sexual Harassment (Section 2(n) of the POSH Act):\nSexual harassment includes unwelcome sexually determined behavior such as physical contact, demand or request for sexual favors, sexually colored remarks, showing pornography, or any other unwelcome physical, verbal, or non-verbal conduct of a sexual nature.",
  correctResponsibleParty: "Respondent",
  correctMisconductType: "Sexual Harassment",
  correctPrimaryMotivation: "Genuine Complaint",
  analysis: "No detailed analysis is available for this case."
};

// Different prompts to generate varied cases
const CASE_VARIATION_PROMPTS = [
  "Create a POSH case about discrimination based on gender in a technology company",
  "Create a POSH case about verbal harassment in a manufacturing setting",
  "Create a POSH case involving online harassment through workplace messaging platforms",
  "Create a POSH case about inappropriate conduct during a company retreat",
  "Create a POSH case about retaliation after reporting harassment",
  "Create a POSH case involving a complicated misunderstanding between colleagues",
  "Create a POSH case where the complainant has mixed motives",
  "Create a POSH case where both parties share responsibility"
];

// Enhanced prompt guidance for consistent formatting
const FORMAT_GUIDANCE = `
Format guidance:
- All fields must be strings unless otherwise specified
- For 'witnessStatements', provide a detailed string containing at least 2-3 witness accounts with each witness on a new paragraph, starting with witness name/role, like:
  "Witness 1 - HR Manager:
  Witness statement content here...
  
  Witness 2 - Team Member:
  Another witness statement here..."
- For 'additionalEvidence', include all evidence as a single formatted string with clear sections
- For correctResponsibleParty, use exactly one of: 'Respondent', 'Complainant', 'Both Parties', 'Neither Party'
- For correctMisconductType, use exactly one of: 'Sexual Harassment', 'Discrimination', 'Retaliation', 'No Misconduct'
- For correctPrimaryMotivation, use exactly one of: 'Genuine Complaint', 'Personal Vendetta', 'Career Advancement', 'Misunderstanding'
`;

// Function to fix or complete missing fields in simulation data
function repairSimulationData(data: any): SimulationData {
  // Create a new object with the template structure
  const repairedData: SimulationData = { ...EMPTY_TEMPLATE };
  
  // Copy over any valid fields from the original data
  if (data) {
    if (typeof data.caseOverview === 'string') repairedData.caseOverview = data.caseOverview;
    if (typeof data.complainantStatement === 'string') repairedData.complainantStatement = data.complainantStatement;
    if (typeof data.respondentStatement === 'string') repairedData.respondentStatement = data.respondentStatement;
    
    // Handle witness statements - normalize to string format if it's in another format
    if (data.witnessStatements) {
      if (typeof data.witnessStatements === 'string') {
        repairedData.witnessStatements = data.witnessStatements;
      } else if (Array.isArray(data.witnessStatements)) {
        // Convert array of witness statements to string
        const witnessText = data.witnessStatements.map((witness: any, index: number) => {
          if (typeof witness === 'string') return `Witness ${index + 1}:\n${witness}`;
          
          const name = witness.name || `Witness ${index + 1}`;
          const statement = witness.statement || JSON.stringify(witness);
          return `${name}:\n${statement}`;
        }).join('\n\n');
        
        repairedData.witnessStatements = witnessText;
      } else if (typeof data.witnessStatements === 'object') {
        // Convert object of witness statements to string
        const witnessText = Object.entries(data.witnessStatements).map(([name, statement]) => {
          return `${name}:\n${statement}`;
        }).join('\n\n');
        
        repairedData.witnessStatements = witnessText;
      }
    }
    
    // Handle additional evidence
    if (data.additionalEvidence) {
      if (typeof data.additionalEvidence === 'string') {
        repairedData.additionalEvidence = data.additionalEvidence;
      } else if (typeof data.additionalEvidence === 'object') {
        // Convert evidence object to formatted string
        const evidenceText = Object.entries(data.additionalEvidence).map(([title, content]) => {
          return `${title}:\n${content}`;
        }).join('\n\n');
        
        repairedData.additionalEvidence = evidenceText;
      }
    }
    
    if (typeof data.legalReferenceGuide === 'string') repairedData.legalReferenceGuide = data.legalReferenceGuide;
    
    // Handle correct answer fields
    if (['Respondent', 'Complainant', 'Both Parties', 'Neither Party'].includes(data.correctResponsibleParty)) {
      repairedData.correctResponsibleParty = data.correctResponsibleParty;
    }
    
    if (['Sexual Harassment', 'Discrimination', 'Retaliation', 'No Misconduct'].includes(data.correctMisconductType)) {
      repairedData.correctMisconductType = data.correctMisconductType;
    }
    
    if (['Genuine Complaint', 'Personal Vendetta', 'Career Advancement', 'Misunderstanding'].includes(data.correctPrimaryMotivation)) {
      repairedData.correctPrimaryMotivation = data.correctPrimaryMotivation;
    }
    
    if (typeof data.analysis === 'string') repairedData.analysis = data.analysis;
  }
  
  return repairedData;
}

// Verify that simulation data has all required sections with actual content
function verifySimulationData(data: SimulationData): boolean {
  // Check if all required fields are present and have meaningful content
  if (!data.caseOverview || data.caseOverview.length < 20) return false;
  if (!data.complainantStatement || data.complainantStatement.length < 20) return false;
  if (!data.respondentStatement || data.respondentStatement.length < 20) return false;
  
  // Special check for witness statements
  if (!data.witnessStatements || (
    typeof data.witnessStatements === 'string' && data.witnessStatements.length < 20
  )) {
    return false;
  }
  
  if (!data.additionalEvidence || data.additionalEvidence.length < 20) return false;
  if (!data.legalReferenceGuide || data.legalReferenceGuide.length < 20) return false;
  if (!data.analysis || data.analysis.length < 20) return false;
  
  // Check if enum values are valid
  const validResponsibleParties = ['Respondent', 'Complainant', 'Both Parties', 'Neither Party'];
  const validMisconductTypes = ['Sexual Harassment', 'Discrimination', 'Retaliation', 'No Misconduct'];
  const validMotivations = ['Genuine Complaint', 'Personal Vendetta', 'Career Advancement', 'Misunderstanding'];
  
  if (!validResponsibleParties.includes(data.correctResponsibleParty)) return false;
  if (!validMisconductTypes.includes(data.correctMisconductType)) return false;
  if (!validMotivations.includes(data.correctPrimaryMotivation)) return false;
  
  return true;
}

// POST API handler
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const encryptedApiKey = cookieStore.get('openai_api_key')?.value;
    const model = cookieStore.get('openai_model')?.value || 'gpt-4o-mini';
    const temperature = parseFloat(cookieStore.get('openai_temperature')?.value || '0.8');
    const maxTokens = parseInt(cookieStore.get('openai_max_tokens')?.value || '4000');

    // Use environment variable as fallback if no API key is configured
    const apiKey = encryptedApiKey 
      ? decrypt(encryptedApiKey) 
      : process.env.OPENAI_API_KEY || '';

    if (!apiKey) {
      console.log('No API key found, using OpenAI API key from environment variable');
      // Continue with the hardcoded API key from environment
    }

    try {
      // Always try to generate a new case, even without API key
      const openai = new OpenAI({ 
        apiKey: apiKey || 'dummy-key-will-fail-gracefully' 
      });

      // Select a random variation prompt to create diverse cases
      const variationPrompt = CASE_VARIATION_PROMPTS[Math.floor(Math.random() * CASE_VARIATION_PROMPTS.length)];
      
      console.log('Generating simulation with model:', model);
      console.log('Temperature:', temperature);
      console.log('Max tokens:', maxTokens);
      console.log('Using variation prompt:', variationPrompt);

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: POSH_TRAINING_SIMULATION_PROMPT + "\n\n" + variationPrompt + "\n\n" + FORMAT_GUIDANCE + "\n\nIMPORTANT: Respond with ONLY valid JSON data. Ensure your response is properly formatted as a JSON object without any extra text before or after the JSON data. The JSON must match the SimulationData interface with these fields: caseOverview, complainantStatement, respondentStatement, witnessStatements, additionalEvidence, legalReferenceGuide, correctResponsibleParty, correctMisconductType, correctPrimaryMotivation, and analysis.",
          },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      });

      let simulationText = completion.choices[0]?.message?.content;

      if (!simulationText) {
        console.log('No simulation text generated, trying again with basic prompt');
        
        // Second attempt with simplified prompt
        const retryCompletion = await openai.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: "Create a detailed POSH (Prevention of Sexual Harassment) case simulation in JSON format. Include the following fields: caseOverview, complainantStatement, respondentStatement, witnessStatements, additionalEvidence, legalReferenceGuide, correctResponsibleParty (must be one of: 'Respondent', 'Complainant', 'Both Parties', 'Neither Party'), correctMisconductType (must be one of: 'Sexual Harassment', 'Discrimination', 'Retaliation', 'No Misconduct'), correctPrimaryMotivation (must be one of: 'Genuine Complaint', 'Personal Vendetta', 'Career Advancement', 'Misunderstanding'), and analysis.",
            },
          ],
          temperature: 0.9, // Slightly higher temperature for more creativity
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
        });
        
        simulationText = retryCompletion.choices[0]?.message?.content;
        
        if (!simulationText) {
          console.log('Second attempt failed, using empty template');
          return NextResponse.json({ simulationText: JSON.stringify(EMPTY_TEMPLATE) });
        }
      }

      console.log('Simulation text generated successfully');
      console.log('First 100 characters:', simulationText.substring(0, 100));

      // Validate that the response is valid JSON
      try {
        const parsedData = JSON.parse(simulationText);
        console.log('Simulation data parsed successfully');
        
        // Check if the parsed data has the required fields
        const requiredFields = [
          'caseOverview', 
          'complainantStatement', 
          'respondentStatement', 
          'witnessStatements',
          'additionalEvidence', 
          'legalReferenceGuide', 
          'correctResponsibleParty', 
          'correctMisconductType', 
          'correctPrimaryMotivation', 
          'analysis'
        ];
        
        const missingFields = requiredFields.filter(field => !(field in parsedData));
        
        if (missingFields.length > 0) {
          console.error('Missing required fields:', missingFields);
          console.log('Attempting to repair the simulation data');
          
          // Try to fix the data instead of using sample data
          const repairedData = repairSimulationData(parsedData);
          
          // Verify the repaired data is complete
          if (!verifySimulationData(repairedData)) {
            console.log('Repaired data is still incomplete, trying one more prompt');
            
            // Try one more time with a specific request for witness statements
            try {
              const witnessCompletion = await openai.chat.completions.create({
                model,
                messages: [
                  {
                    role: 'system',
                    content: "Create 2-3 detailed witness statements for a workplace harassment case. Each statement should include the witness name, role, and a detailed account of what they witnessed. Format as plain text with each witness separated by blank lines.",
                  }
                ],
                temperature: 0.8,
                max_tokens: 1000,
              });
              
              const witnessText = witnessCompletion.choices[0]?.message?.content;
              if (witnessText && witnessText.length > 50) {
                repairedData.witnessStatements = witnessText;
              }
            } catch (witnessError) {
              console.error('Error generating witness statements:', witnessError);
            }
          }
          
          return NextResponse.json({ simulationText: JSON.stringify(repairedData) });
        }
        
        // Validate enum values
        const validResponsibleParties = ['Respondent', 'Complainant', 'Both Parties', 'Neither Party'];
        const validMisconductTypes = ['Sexual Harassment', 'Discrimination', 'Retaliation', 'No Misconduct'];
        const validMotivations = ['Genuine Complaint', 'Personal Vendetta', 'Career Advancement', 'Misunderstanding'];
        
        if (!validResponsibleParties.includes(parsedData.correctResponsibleParty) || 
            !validMisconductTypes.includes(parsedData.correctMisconductType) || 
            !validMotivations.includes(parsedData.correctPrimaryMotivation)) {
          
          console.log('Invalid enum values, repairing data');
          const repairedData = repairSimulationData(parsedData);
          return NextResponse.json({ simulationText: JSON.stringify(repairedData) });
        }
        
        // Verify that the data has meaningful content
        if (!verifySimulationData(parsedData)) {
          console.log('Parsed data has empty or incomplete fields, repairing data');
          const repairedData = repairSimulationData(parsedData);
          
          // Try to generate witness statements if they're missing or too short
          if (!parsedData.witnessStatements || 
              (typeof parsedData.witnessStatements === 'string' && parsedData.witnessStatements.length < 50)) {
            try {
              const witnessCompletion = await openai.chat.completions.create({
                model,
                messages: [
                  {
                    role: 'system',
                    content: `Based on this case overview: "${parsedData.caseOverview.substring(0, 200)}...", create 2-3 detailed witness statements. Each statement should include the witness name, role, and a detailed account of what they witnessed. Format as plain text with each witness separated by blank lines.`,
                  }
                ],
                temperature: 0.8,
                max_tokens: 1000,
              });
              
              const witnessText = witnessCompletion.choices[0]?.message?.content;
              if (witnessText && witnessText.length > 50) {
                repairedData.witnessStatements = witnessText;
              }
            } catch (witnessError) {
              console.error('Error generating witness statements:', witnessError);
            }
          }
          
          return NextResponse.json({ simulationText: JSON.stringify(repairedData) });
        }
        
        // Data is valid, return as is
        return NextResponse.json({ simulationText });
      } catch (parseError) {
        console.error('Error parsing simulation data:', parseError);
        
        // Try to extract JSON from the response
        const jsonMatch = simulationText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extractedJson = jsonMatch[0];
            console.log('Extracted JSON from response');
            const parsedData = JSON.parse(extractedJson);
            const repairedData = repairSimulationData(parsedData);
            return NextResponse.json({ simulationText: JSON.stringify(repairedData) });
          } catch (extractError) {
            console.error('Failed to extract valid JSON:', extractError);
          }
        }
        
        console.log('Using empty template instead');
        return NextResponse.json({ simulationText: JSON.stringify(EMPTY_TEMPLATE) });
      }
    } catch (openaiError) {
      console.error('Error with OpenAI API:', openaiError);
      console.log('Using empty template instead');
      return NextResponse.json({ simulationText: JSON.stringify(EMPTY_TEMPLATE) });
    }
  } catch (error) {
    console.error('Error generating simulation:', error);
    console.log('Using empty template due to error');
    return NextResponse.json({ simulationText: JSON.stringify(EMPTY_TEMPLATE) });
  }
} 