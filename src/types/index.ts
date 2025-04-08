export interface SimulationResponse {
  simulation: string;
  error?: string;
}

export type SimulationSection = 'overview' | 'complainant' | 'respondent' | 'witnesses' | 'evidence' | 'legal' | 'conclusion';

export type ResponsibleParty = 'Respondent' | 'Complainant' | 'Both Parties' | 'Neither Party';

export type MisconductType = 'Sexual Harassment' | 'Discrimination' | 'Retaliation' | 'No Misconduct';

export type PrimaryMotivation = 'Genuine Complaint' | 'Personal Vendetta' | 'Career Advancement' | 'Misunderstanding';

export interface ConclusionData {
  responsibleParty: ResponsibleParty;
  misconductType: MisconductType;
  primaryMotivation: PrimaryMotivation;
}

export interface WitnessStatement {
  name?: string;
  statement?: string;
}

export interface SimulationData {
  caseOverview: string;
  complainantStatement: string;
  respondentStatement: string;
  witnessStatements: string | WitnessStatement[] | Record<string, string>;
  additionalEvidence: string;
  legalReferenceGuide: string;
  correctResponsibleParty: ResponsibleParty;
  correctMisconductType: MisconductType;
  correctPrimaryMotivation: PrimaryMotivation;
  analysis: string;
} 