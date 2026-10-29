/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CareerRecord } from '../types.ts';

export const INITIAL_CAREER_RECORDS: CareerRecord[] = [
  {
    id: 'rec-001',
    name: '박지원',
    affiliation: '2학년 1반 (플랫폼개발팀)',
    age: 56,
    tenure: 12,
    totalExp: 22,
    currentDuties: '플랫폼 시스템 코어 아키텍처 및 백엔드 개발, 사내 개발자 직무 교육',
    scoreBreakdown: {
      ageScore: 30,
      tenureScore: 30,
      expScore: 40,
      totalScore: 100,
      ageTier: '55세 이상',
      tenureTier: '10년 이상',
      expTier: '20년 이상',
    },
    savedAt: '2026-10-27 15:30',
  },
  {
    id: 'rec-002',
    name: '홍길동',
    affiliation: '2학년 3반 (영업기획팀)',
    age: 52,
    tenure: 8,
    totalExp: 16,
    currentDuties: '영업기획팀 파이프라인 관리 및 2학년 취업 진로 상담 전담, 전사 세일즈 대시보드 구축',
    scoreBreakdown: {
      ageScore: 25,
      tenureScore: 20,
      expScore: 30,
      totalScore: 75,
      ageTier: '50~54세',
      tenureTier: '5~9년',
      expTier: '10~19년',
    },
    savedAt: '2026-10-28 14:20',
  },
  {
    id: 'rec-003',
    name: '최영호',
    affiliation: '1학년 4반 (디지털마케팅팀)',
    age: 42,
    tenure: 3,
    totalExp: 8,
    currentDuties: '디지털 마케팅 캠페인 운영, SNS 채널 분석 및 CRM 자동화',
    scoreBreakdown: {
      ageScore: 15,
      tenureScore: 10,
      expScore: 20,
      totalScore: 45,
      ageTier: '40~44세',
      tenureTier: '1~4년',
      expTier: '5~9년',
    },
    savedAt: '2026-10-28 11:10',
  },
  {
    id: 'rec-004',
    name: '한동훈',
    affiliation: '3학년 2반 (인사총무팀)',
    age: 48,
    tenure: 9,
    totalExp: 18,
    currentDuties: '전사 인사고과 평가제도 개편 및 인재개발 교육 기획',
    scoreBreakdown: {
      ageScore: 20,
      tenureScore: 20,
      expScore: 30,
      totalScore: 70,
      ageTier: '45~49세',
      tenureTier: '5~9년',
      expTier: '10~19년',
    },
    savedAt: '2026-10-26 17:00',
  }
];
