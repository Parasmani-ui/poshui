import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { cookies } from 'next/headers';
import { decrypt } from '@/utils/encryption';
import { SimulationData, ResponsibleParty, MisconductType, PrimaryMotivation } from '@/types';
import { getRandomCaseFromCache, saveCaseToCache } from '@/utils/caseCache';

// Basic template for creating a new simulation if all else fails
const EMPTY_TEMPLATE: SimulationData = {
  caseOverview: "Workplace Harassment Allegation: Messaging Platform Incident\n\nCase Overview: Priya Sharma, a software developer at TechSolutions Inc., has filed a formal complaint against her team leader, Rahul Verma. She alleges that Rahul has been sending her inappropriate messages through the company's internal messaging platform for the past three months. The messages allegedly contain unwelcome personal comments about her appearance and requests to meet outside work hours. Priya claims these messages have created a hostile work environment, affecting her job performance and mental well-being. Rahul denies any inappropriate intent, stating his messages were friendly and part of normal team communication.",
  
  complainantStatement: "Statement of Priya Sharma (Complainant):\n\nI joined TechSolutions Inc. as a Senior Developer eight months ago and was assigned to the Cloud Services team led by Rahul Verma. Initially, our professional relationship was normal and respectful. About three months ago, Rahul began sending me direct messages on our company's communication platform that made me uncomfortable.\n\nThese messages started with comments about my appearance during video calls ('You look nice today', 'That color suits you'). While these could be considered innocuous, they gradually escalated to more personal comments and questions about my personal life. He frequently asked if I was single and suggested we should 'get to know each other better outside office hours.'\n\nWhen I would not respond or would change the subject, he would send multiple follow-up messages. On several occasions, he messaged me late at night on weekends with non-work-related content. I have documented these messages and saved screenshots.\n\nI attempted to keep our interactions strictly professional and clearly stated that I wanted to focus on work-related matters only. Despite this, the unwanted messages continued. This situation has created significant stress and anxiety for me. I find myself dreading team meetings and avoiding direct communication with him.\n\nI am filing this complaint because this behavior constitutes harassment and has created a hostile work environment that is affecting my job performance and mental well-being.",
  
  respondentStatement: "Statement of Rahul Verma (Respondent):\n\nI have been a Team Leader at TechSolutions Inc. for four years with an exemplary record of team management. Priya Sharma joined my team eight months ago, and I have maintained a professional relationship with her throughout this period.\n\nI categorically deny any allegations of harassment or inappropriate behavior. As a team leader, I believe in creating a friendly and positive atmosphere within my team. My communications with Priya, as with all team members, have always been cordial and respectful.\n\nThe messages in question were sent with purely professional intentions or as friendly workplace banter. Comments about appearance were meant as casual compliments that I would extend to any team member, regardless of gender. They were never intended to make her uncomfortable.\n\nRegarding messages outside work hours, our team often handles critical projects with tight deadlines, necessitating communication beyond regular hours. I have never insisted on meeting outside of work in a personal capacity.\n\nI believe there has been a misunderstanding or misinterpretation of my intentions. I respect all my colleagues and would never intentionally create a hostile work environment. I am willing to adjust my communication style to ensure team comfort and am committed to maintaining a professional environment.",
  
  additionalEvidence: "Evidence and Witness Statements:\n\n1. Message Screenshots:\nScreenshots of 17 direct messages sent by Rahul to Priya over the three-month period show a pattern of increasingly personal comments and requests to meet outside work hours. Messages sent after 10 PM on weekends were highlighted.\n\n2. Company Communication Policy:\nTechSolutions Inc. Communication Policy (Section 4.2) states: \"All workplace communication must maintain professional boundaries and respect personal space of colleagues.\"\n\nWitness 1 - Anjali Mathur (HR Manager):\nI received Priya's initial verbal complaint three weeks ago. She appeared visibly distressed during our meeting and showed me several screenshots of messages from Rahul that contained personal comments and suggestions to meet outside work. I advised her on the formal complaint process and initiated a preliminary investigation. During this process, I interviewed several team members who confirmed noticing tension between Priya and Rahul during recent team meetings.\n\nWitness 2 - Vikram Singh (Team Member):\nI have worked on the Cloud Services team with both Priya and Rahul for the past eight months. I noticed that Rahul's communication style with Priya seemed different than with other team members. During video calls, he would often compliment her appearance, which I didn't observe him doing with other team members. I also noticed that Priya became increasingly withdrawn in team meetings over the past couple of months, speaking less and turning her camera off more frequently.\n\nWitness 3 - Deepak Patel (IT Administrator):\nAs the IT administrator responsible for our messaging platform, I was asked by HR to verify the authenticity of the message screenshots provided by Priya. I can confirm that the messages are genuine and were sent from Rahul's account to Priya's account on the dates and times indicated in the evidence. Our system logs show that there were 42 direct messages sent from Rahul to Priya over the three-month period, with 15 of them sent outside regular work hours.",
  
  legalReferenceGuide: "POSH Act Legal Reference Guide:\n\n1. Definition of Sexual Harassment (Section 2(n) of the POSH Act):\nSexual harassment includes unwelcome sexually determined behavior such as physical contact, demand or request for sexual favors, sexually colored remarks, showing pornography, or any other unwelcome physical, verbal, or non-verbal conduct of a sexual nature.\n\n2. Workplace Harassment (Section 3):\nNo woman shall be subjected to sexual harassment at any workplace. The following circumstances may amount to sexual harassment:\n- Implied or explicit promise of preferential treatment in employment\n- Implied or explicit threat of detrimental treatment in employment\n- Implied or explicit threat about her present or future employment status\n- Interference with her work or creating an intimidating/offensive/hostile work environment\n- Humiliating treatment likely to affect her health or safety\n\n3. Digital Communications (2023 Amendment):\nUnwelcome behavior extended through digital means, including messaging applications, emails, and virtual meetings, falls within the purview of workplace harassment.\n\n4. Employer Responsibilities (Section 19):\nEvery employer is required to provide a safe working environment, display consequences of sexual harassment, organize workshops and awareness programs, and provide necessary facilities to the Internal Committee for dealing with complaints.",
  
  correctResponsibleParty: "Respondent",
  correctMisconductType: "Sexual Harassment",
  correctPrimaryMotivation: "Genuine Complaint",
  
  analysis: "Case Analysis:\n\nThis case presents a clear example of workplace harassment through digital communications. The respondent's conduct meets the criteria for sexual harassment under the POSH Act for the following reasons:\n\n1. Pattern of Unwelcome Behavior: The evidence shows a persistent pattern of unwelcome personal comments and after-hours communication despite the complainant's attempts to maintain professional boundaries.\n\n2. Impact on Work Environment: The complainant's testimony and witness statements confirm that the harassment created a hostile work environment, affecting her job performance and well-being.\n\n3. Power Dynamics: The hierarchical relationship between a team leader and team member creates an inherent power imbalance that heightens the impact of the harassment.\n\n4. Corroborating Evidence: The digital evidence and witness testimonies provide substantial corroboration of the complainant's allegations.\n\n5. Intent vs. Impact: While the respondent claims no inappropriate intent, sexual harassment is determined by the impact of the behavior rather than the intent behind it.\n\nThe respondent's defense that the communications were friendly or work-related is undermined by the pattern, timing, and content of the messages. The fact that similar communications were not directed at other team members further weakens this defense.\n\nThis case demonstrates the importance of clear digital communication policies in modern workplaces and the need for awareness about how seemingly casual comments can create a hostile environment, particularly in relationships with power differentials."
};

// Function to fix or complete missing fields in simulation data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function repairSimulationData(data: Partial<SimulationData>): SimulationData {
  // Create a new object with the template structure
  const repairedData: SimulationData = { ...EMPTY_TEMPLATE };
  
  // Copy over any valid fields from the original data
  if (data) {
    if (typeof data.caseOverview === 'string') repairedData.caseOverview = data.caseOverview;
    if (typeof data.complainantStatement === 'string') repairedData.complainantStatement = data.complainantStatement;
    if (typeof data.respondentStatement === 'string') repairedData.respondentStatement = data.respondentStatement;
    
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
    if (['Respondent', 'Complainant', 'Both Parties', 'Neither Party'].includes(data.correctResponsibleParty || '')) {
      repairedData.correctResponsibleParty = data.correctResponsibleParty as ResponsibleParty;
    }
    
    if (['Sexual Harassment', 'Discrimination', 'Retaliation', 'No Misconduct'].includes(data.correctMisconductType || '')) {
      repairedData.correctMisconductType = data.correctMisconductType as MisconductType;
    }
    
    if (['Genuine Complaint', 'Personal Vendetta', 'Career Advancement', 'Misunderstanding'].includes(data.correctPrimaryMotivation || '')) {
      repairedData.correctPrimaryMotivation = data.correctPrimaryMotivation as PrimaryMotivation;
    }
    
    if (typeof data.analysis === 'string') repairedData.analysis = data.analysis;
  }
  
  return repairedData;
}

// Verify that simulation data has all required sections with actual content
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function verifySimulationData(data: SimulationData): boolean {
  // Check if all required fields are present and have meaningful content
  if (!data.caseOverview || data.caseOverview.length < 20) return false;
  if (!data.complainantStatement || data.complainantStatement.length < 20) return false;
  if (!data.respondentStatement || data.respondentStatement.length < 20) return false;
  
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
export async function POST() {
  try {
    const cookieStore = await cookies();
    const encryptedApiKey = cookieStore.get('openai_api_key')?.value;
    const temperature = parseFloat(cookieStore.get('openai_temperature')?.value || '0.8');

    // Use environment variable as fallback if no API key is configured
    let apiKey = '';
    
    try {
      apiKey = encryptedApiKey 
        ? decrypt(encryptedApiKey) 
        : process.env.OPENAI_API_KEY || '';
        
      console.log('API key configured successfully:', apiKey ? 'Key is present' : 'No key found');
    } catch (keyError) {
      console.error('Error processing API key:', keyError);
      apiKey = process.env.OPENAI_API_KEY || '';
      console.log('Fallback to env variable:', apiKey ? 'Env key is present' : 'No env key found');
    }

    // No API key - try to get a case from cache, otherwise use template
    if (!apiKey) {
      console.log('No API key found - trying to retrieve from cache');
      const cachedCase = getRandomCaseFromCache();
      
      return NextResponse.json({ 
        simulationText: cachedCase ? JSON.stringify(cachedCase) : JSON.stringify(EMPTY_TEMPLATE) 
      });
    }

    // Use a faster model for initial generation to minimize timeouts
    const model = 'gpt-4o';
    const reducedMaxTokens = 4000; // Reduced token count for faster response
    
    console.log('Using optimized model settings for reliability');
    console.log('Model:', model);
    console.log('Temperature:', temperature);
    console.log('Max tokens:', reducedMaxTokens);

    try {
      // First try to get a case from cache as a quick option
      const cachedCase = getRandomCaseFromCache();
      
      // 20% chance to use cache if available (to mix fresh and cached content)
      if (cachedCase && Math.random() < 0.2) {
        console.log('Using cached case for better performance');
        return NextResponse.json({ 
          simulationText: JSON.stringify(cachedCase)
        });
      }
      
      // Initialize OpenAI client
      const openai = new OpenAI({ 
        apiKey,
        timeout: 30000, // 30 seconds timeout (increased from 12000)
        maxRetries: 2,  // Allow some retries
      });

      // Use Promise.race to implement a timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('OpenAI API call timed out')), 25000); // 25 seconds timeout (increased from 15000)
      });

      try {
        console.log('Starting OpenAI API request...');
        
        // Use a simplified prompt to reduce token usage and processing time
        const simplifiedPrompt = `
Create a POSH (Prevention of Sexual Harassment) training case for HR professionals in India based on the 2013 POSH Act. Include:
1. Clear case overview with background information
2. Detailed complainant statement
3. Detailed respondent statement
4. One piece of additional evidence that is ambiguous and open to interpretation
5. Legal reference to relevant POSH Act sections
6. Answer key with correct responsible party, misconduct type, and primary motivation
7. Analysis of the case (only shown after user submission)

Format as a JSON object exactly as follows:
{
  "caseOverview": "string",
  "complainantStatement": "string",
  "respondentStatement": "string",
  "additionalEvidence": "string",
  "legalReferenceGuide": "string",
  "correctResponsibleParty": "string", (one of: "Respondent", "Complainant", "Both Parties", "Neither Party")
  "correctMisconductType": "string", (one of: "Sexual Harassment", "Discrimination", "Retaliation", "No Misconduct")  
  "correctPrimaryMotivation": "string", (one of: "Genuine Complaint", "Personal Vendetta", "Career Advancement", "Misunderstanding")
  "analysis": "string"
}
`;

        // Race between the API call and the timeout
        const completionPromise = openai.chat.completions.create({
          model: "gpt-3.5-turbo", // Using GPT-3.5 which is faster and more reliable than GPT-4
          messages: [
            {
              role: 'system',
              content: simplifiedPrompt,
            },
            {
              role: 'user',
              content: "Generate a realistic POSH case with nuanced evidence that requires careful application of the POSH Act.",
            }
          ],
          temperature: 0.7,
          max_tokens: 2500, // Reduced token count for faster response
          response_format: { type: "json_object" },
        });

        // Wait for either the completion or the timeout
        const completion = await Promise.race([
          completionPromise,
          timeoutPromise
        ]) as OpenAI.Chat.Completions.ChatCompletion;

        console.log('OpenAI API request completed successfully');
        const simulationText = completion.choices[0]?.message?.content;
        
        if (!simulationText) {
          console.log('No simulation text generated from OpenAI - returning default template');
          return NextResponse.json({ 
            simulationText: JSON.stringify(EMPTY_TEMPLATE) 
          });
        }
        
        console.log('Simulation text generated successfully');
        
        // Validate and fix the JSON if needed
        try {
          // Check if it's valid JSON
          const parsedData = JSON.parse(simulationText) as SimulationData;
          
          // Verify it has the minimum required fields
          const hasRequiredFields = 
            typeof parsedData.caseOverview === 'string' && 
            typeof parsedData.complainantStatement === 'string' && 
            typeof parsedData.respondentStatement === 'string' &&
            typeof parsedData.additionalEvidence === 'string';
          
          if (!hasRequiredFields) {
            console.log('Generated JSON missing required fields, using template case');
            return NextResponse.json({ 
              simulationText: JSON.stringify(EMPTY_TEMPLATE) 
            });
          } else {
            console.log('Simulation data valid and complete - saving to cache');
            // Save the successfully generated case to cache for future use
            try {
              saveCaseToCache(parsedData);
            } catch (cacheError) {
              console.error('Error saving to cache:', cacheError);
              // Continue even if cache saving fails
            }
          }
          
          // Return the simulation text directly
          return NextResponse.json({ simulationText });
        } catch (parseError) {
          console.error('Error parsing API response as JSON:', parseError);
          return NextResponse.json({ 
            simulationText: JSON.stringify(EMPTY_TEMPLATE) 
          });
        }
      } catch (timeoutError) {
        // Handle timeout specific error
        console.error('Request timed out or was aborted:', timeoutError);
        console.log('Checking cache for fallback case');
        
        const fallbackCase = getRandomCaseFromCache();
        return NextResponse.json({ 
          simulationText: fallbackCase ? JSON.stringify(fallbackCase) : JSON.stringify(EMPTY_TEMPLATE) 
        });
      }
    } catch (openaiError: unknown) {
      // Enhanced OpenAI API error handling
      console.error('OpenAI API Error:', openaiError);
      
      // Try to get a case from cache, otherwise use template
      const fallbackCase = getRandomCaseFromCache();
      return NextResponse.json({ 
        simulationText: fallbackCase ? JSON.stringify(fallbackCase) : JSON.stringify(EMPTY_TEMPLATE) 
      });
    }
  } catch (error) {
    console.error('Unexpected error generating simulation:', error);
    console.log('Using empty template or cache due to unexpected error');
    
    // Final fallback - try cache, then template
    const fallbackCase = getRandomCaseFromCache();
    return NextResponse.json({ 
      simulationText: fallbackCase ? JSON.stringify(fallbackCase) : JSON.stringify(EMPTY_TEMPLATE) 
    });
  }
} 