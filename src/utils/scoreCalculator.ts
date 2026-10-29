/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScoreResult } from '../types.ts';

/**
 * 엑셀 시트의 실제 구간 배점표 수치로 손쉽게 수정 가능한 기준 테이블 설정
 */
export const SCORE_BENCHMARKS = {
  ageTable: [
    { min: 55, score: 30, label: '55세 이상' },
    { min: 50, score: 25, label: '50~54세' },
    { min: 45, score: 20, label: '45~49세' },
    { min: 40, score: 15, label: '40~44세' },
    { min: 0,  score: 10, label: '40세 미만' },
  ],
  tenureTable: [
    { min: 10, score: 30, label: '10년 이상' },
    { min: 5,  score: 20, label: '5~9년' },
    { min: 1,  score: 10, label: '1~4년' },
    { min: 0,  score: 0,  label: '1년 미만' },
  ],
  expTable: [
    { min: 20, score: 40, label: '20년 이상' },
    { min: 10, score: 30, label: '10~19년' },
    { min: 5,  score: 20, label: '5~9년' },
    { min: 0,  score: 10, label: '5년 미만' },
  ],
};

/**
 * 순환보직 직원 경력 배점 산출 알고리즘
 * @param age 나이 (만 나이)
 * @param tenure 재직기간 (년)
 * @param totalExp 총경력 (년)
 * @returns ScoreResult
 */
export function calculateScore(age: number, tenure: number, totalExp: number): ScoreResult {
  // 1. 나이 배점 계산 (30점 만점)
  const ageMatch = SCORE_BENCHMARKS.ageTable.find(item => age >= item.min) 
    || SCORE_BENCHMARKS.ageTable[SCORE_BENCHMARKS.ageTable.length - 1];

  // 2. 재직기간 배점 계산 (30점 만점)
  const tenureMatch = SCORE_BENCHMARKS.tenureTable.find(item => tenure >= item.min)
    || SCORE_BENCHMARKS.tenureTable[SCORE_BENCHMARKS.tenureTable.length - 1];

  // 3. 총경력 배점 계산 (40점 만점)
  const expMatch = SCORE_BENCHMARKS.expTable.find(item => totalExp >= item.min)
    || SCORE_BENCHMARKS.expTable[SCORE_BENCHMARKS.expTable.length - 1];

  const totalScore = ageMatch.score + tenureMatch.score + expMatch.score;

  return {
    ageScore: ageMatch.score,
    tenureScore: tenureMatch.score,
    expScore: expMatch.score,
    totalScore,
    ageTier: ageMatch.label,
    tenureTier: tenureMatch.label,
    expTier: expMatch.label,
  };
}

/**
 * 1년 6개월 -> 1.06, 2년 2개월 -> 2.02, 2년 11개월 -> 2.11 형태의 수치를 "X년 Y개월" 표시 형식으로 변환
 */
export function formatYearMonthDisplay(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  const str = String(val).trim();
  const num = parseFloat(str);
  if (isNaN(num) || num < 0) return '';
  const parts = str.split('.');
  const years = parseInt(parts[0] || '0', 10);
  if (parts.length < 2 || !parts[1]) return `${years}년`;
  const monthStr = parts[1].padEnd(2, '0').slice(0, 2);
  const months = parseInt(monthStr, 10);
  if (months === 0) return `${years}년`;
  return `${years}년 ${months}개월`;
}
