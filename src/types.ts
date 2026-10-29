/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'employee' | 'admin';

export interface ScoreResult {
  ageScore: number;
  tenureScore: number;
  expScore: number;
  totalScore: number;
  ageTier: string;
  tenureTier: string;
  expTier: string;
}

export interface CareerRecord {
  id: string;
  userId?: string;
  name: string;
  affiliation: string;
  age: number;
  tenure: number;
  totalExp: number;
  currentDuties: string;
  scoreBreakdown: ScoreResult;
  savedAt: string;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
