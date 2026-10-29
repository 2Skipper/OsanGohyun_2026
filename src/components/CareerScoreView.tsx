/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, FileSpreadsheet, RefreshCw, Save, Sparkles, TrendingUp } from 'lucide-react';
import { CareerRecord, ScoreResult } from '../types.ts';
import { calculateScore, formatYearMonthDisplay } from '../utils/scoreCalculator.ts';

interface CareerScoreViewProps {
  currentUserName: string;
  currentUserAffiliation: string;
  onSaveRecord: (record: CareerRecord) => void;
  existingRecord?: CareerRecord;
}

export const CareerScoreView: React.FC<CareerScoreViewProps> = ({
  currentUserName,
  currentUserAffiliation,
  onSaveRecord,
  existingRecord,
}) => {
  // 입력 항목 상태 (직접 타이핑 가능하도록 문자열 상태로 관리)
  const [name, setName] = useState<string>(existingRecord?.name || currentUserName || '홍길동');
  const [ageInput, setAgeInput] = useState<string>(existingRecord ? String(existingRecord.age) : '52');
  const [tenureInput, setTenureInput] = useState<string>(existingRecord ? String(existingRecord.tenure) : '8.00');
  const [totalExpInput, setTotalExpInput] = useState<string>(existingRecord ? String(existingRecord.totalExp) : '16.00');
  const [currentDuties, setCurrentDuties] = useState<string>(
    existingRecord?.currentDuties || '영업기획팀 파이프라인 관리 및 2학년 취업 진로 상담 전담, 사내 데이터 대시보드 프로젝트 주도'
  );

  // 실시간 계산 결과
  const [liveScore, setLiveScore] = useState<ScoreResult>(() => {
    const a = parseFloat(ageInput) || 0;
    const t = parseFloat(tenureInput) || 0;
    const e = parseFloat(totalExpInput) || 0;
    return calculateScore(a, t, e);
  });

  // 저장 완료 후 표시할 결과 레코드
  const [savedResult, setSavedResult] = useState<CareerRecord | null>(existingRecord || null);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 입력값 변경 시 실시간 점수 재계산 (직접 타이핑 지원)
  useEffect(() => {
    const a = parseFloat(ageInput) || 0;
    const t = parseFloat(tenureInput) || 0;
    const e = parseFloat(totalExpInput) || 0;
    const calculated = calculateScore(a, t, e);
    setLiveScore(calculated);
  }, [ageInput, tenureInput, totalExpInput]);

  // 저장 처리 핸들러 (Firestore rotation_records)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const a = parseFloat(ageInput) || 0;
    const t = parseFloat(tenureInput) || 0;
    const exp = parseFloat(totalExpInput) || 0;
    const calculated = calculateScore(a, t, exp);

    const newRecord: CareerRecord = {
      id: existingRecord?.id || `rec-${Date.now()}`,
      name: name.trim() || currentUserName,
      affiliation: currentUserAffiliation || '2학년 3반',
      age: a,
      tenure: t,
      totalExp: exp,
      currentDuties: currentDuties.trim(),
      scoreBreakdown: calculated,
      savedAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
    };

    setTimeout(() => {
      onSaveRecord(newRecord);
      setSavedResult(newRecord);
      setIsSaving(false);

      // 하단 결과 영역으로 스크롤
      const element = document.getElementById('saved-score-banner');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 350);
  };

  const resetToSample = (preset: 'senior' | 'mid' | 'junior') => {
    if (preset === 'senior') {
      setAgeInput('56');
      setTenureInput('12.00');
      setTotalExpInput('22.06');
    } else if (preset === 'mid') {
      setAgeInput('48');
      setTenureInput('7.02');
      setTotalExpInput('14.11');
    } else {
      setAgeInput('38');
      setTenureInput('2.02');
      setTotalExpInput('4.06');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* 상단 안내 배너 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              순환보직 평정 시스템
            </span>
            <span className="text-xs text-slate-400">100점 만점 배점표 기준</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">직원 경력 정보 입력 및 배점 계산</h2>
          <p className="text-xs text-slate-500 mt-1">
            소속 및 개인 경력 데이터를 입력하면 엑셀 평정 기준에 따라 실시간으로 배점이 산출됩니다.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowBenchmarkModal(true)}
            className="px-3.5 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 flex items-center transition"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-brand-600" />
            <span>배점 기준표 보기</span>
          </button>
        </div>
      </div>

      {/* 경력 정보 입력 폼 */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600 mr-2"></span>
              경력 세부 정보 작성
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">나이, 재직기간, 총경력, 올해 나의 업무를 정확히 기재해 주세요.</p>
          </div>

          {/* 샘플 데이터 프리셋 */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">테스트 프리셋:</span>
            <button
              type="button"
              onClick={() => resetToSample('senior')}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:border-brand-300 rounded-lg text-slate-600 font-medium"
            >
              56세(고경력)
            </button>
            <button
              type="button"
              onClick={() => resetToSample('mid')}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:border-brand-300 rounded-lg text-slate-600 font-medium"
            >
              48세(중견)
            </button>
            <button
              type="button"
              onClick={() => resetToSample('junior')}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:border-brand-300 rounded-lg text-slate-600 font-medium"
            >
              38세(주니어)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. 이름 */}
            <div>
              <label htmlFor="input-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                이름 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="input-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden transition"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                  {currentUserAffiliation || '2학년 3반'}
                </span>
              </div>
            </div>

            {/* 2. 나이 */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="input-age" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  나이 (만 나이) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                  현재 {liveScore.ageScore}점 ({liveScore.ageTier})
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  id="input-age"
                  required
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                  placeholder="예: 52"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-hidden transition"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">세</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 px-1">
                <span>55세↑ (30점)</span>
                <span>50~54세 (25점)</span>
                <span>45~49세 (20점)</span>
                <span>40~44세 (15점)</span>
                <span>40세↓ (10점)</span>
              </div>
            </div>

            {/* 3. 재직기간(년) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="input-tenure" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  본교/당사 재직기간 (년) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  현재 {liveScore.tenureScore}점 ({liveScore.tenureTier})
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  id="input-tenure"
                  required
                  value={tenureInput}
                  onChange={(e) => setTenureInput(e.target.value)}
                  placeholder="예: 1.06 (1년 6개월)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-hidden transition"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                  {tenureInput.trim() ? formatYearMonthDisplay(tenureInput) : '년'}
                </span>
              </div>

              {/* [요구사항 핵심] 입력 예시 가이드 및 실시간 환산 */}
              <div className="mt-1.5 bg-indigo-50/80 border border-indigo-100 rounded-lg p-2 text-xs space-y-1">
                <div className="text-indigo-900 font-semibold text-[11px] leading-relaxed">
                  💡 <strong>입력예시:</strong> 1년 6개월은 <code className="bg-white px-1 py-0.5 rounded text-indigo-700 font-bold border border-indigo-200">1.06</code>, 2년 2개월은 <code className="bg-white px-1 py-0.5 rounded text-indigo-700 font-bold border border-indigo-200">2.02</code>, 2년 11개월은 <code className="bg-white px-1 py-0.5 rounded text-indigo-700 font-bold border border-indigo-200">2.11</code>로 직접 입력하세요.
                </div>
                {tenureInput.trim() && (
                  <div className="text-[11px] text-indigo-700 flex items-center pt-0.5">
                    <span className="font-bold mr-1.5">실시간 환산:</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 font-black text-indigo-800">
                      {formatYearMonthDisplay(tenureInput)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 mt-1 px-1">
                <span>10년 이상 (30점)</span>
                <span>5~9년 (20점)</span>
                <span>1~4년 (10점)</span>
                <span>1년 미만 (0점)</span>
              </div>
            </div>

            {/* 4. 총경력(년) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="input-total-exp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  총 경력 기간 (년) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  현재 {liveScore.expScore}점 ({liveScore.expTier})
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  id="input-total-exp"
                  required
                  value={totalExpInput}
                  onChange={(e) => setTotalExpInput(e.target.value)}
                  placeholder="예: 2.11 (2년 11개월)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-hidden transition"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                  {totalExpInput.trim() ? formatYearMonthDisplay(totalExpInput) : '년'}
                </span>
              </div>

              {/* [요구사항 핵심] 입력 예시 가이드 및 실시간 환산 */}
              <div className="mt-1.5 bg-purple-50/80 border border-purple-100 rounded-lg p-2 text-xs space-y-1">
                <div className="text-purple-900 font-semibold text-[11px] leading-relaxed">
                  💡 <strong>입력예시:</strong> 1년 6개월은 <code className="bg-white px-1 py-0.5 rounded text-purple-700 font-bold border border-purple-200">1.06</code>, 2년 2개월은 <code className="bg-white px-1 py-0.5 rounded text-purple-700 font-bold border border-purple-200">2.02</code>, 2년 11개월은 <code className="bg-white px-1 py-0.5 rounded text-purple-700 font-bold border border-purple-200">2.11</code>로 직접 입력하세요.
                </div>
                {totalExpInput.trim() && (
                  <div className="text-[11px] text-purple-700 flex items-center pt-0.5">
                    <span className="font-bold mr-1.5">실시간 환산:</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-purple-200 font-black text-purple-800">
                      {formatYearMonthDisplay(totalExpInput)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 mt-1 px-1">
                <span>20년 이상 (40점)</span>
                <span>10~19년 (30점)</span>
                <span>5~9년 (20점)</span>
                <span>5년 미만 (10점)</span>
              </div>
            </div>

          </div>

          {/* 5. 올해 나의 업무 */}
          <div>
            <label htmlFor="input-duties" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              올해 나의 업무 (담당 직무 및 주요 과업) <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="input-duties"
              rows={3}
              required
              value={currentDuties}
              onChange={(e) => setCurrentDuties(e.target.value)}
              placeholder="올해 담당하고 있는 주요 업무, 수업, 소속 프로젝트 및 과업을 구체적으로 서술하세요."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-hidden transition"
            />
          </div>

          {/* 실시간 배점 산출 미리보기 카드 */}
          <div className="bg-gradient-to-br from-slate-50 via-brand-50/30 to-indigo-50/40 p-5 rounded-2xl border border-brand-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-900 flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5 text-brand-600" />
                실시간 배점 합산 미리보기 (100점 만점 기준)
              </span>
              <span className="text-xs font-bold text-brand-700">
                예상 총점: <strong className="text-base text-brand-700">{liveScore.totalScore}</strong> / 100점
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">나이 배점</span>
                  <span className="font-bold text-brand-600">{liveScore.ageScore} / 30점</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-brand-600 h-full rounded-full transition-all duration-300" style={{ width: `${(liveScore.ageScore / 30) * 100}%` }}></div>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">{liveScore.ageTier}</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">재직기간 배점</span>
                  <span className="font-bold text-indigo-600">{liveScore.tenureScore} / 30점</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${(liveScore.tenureScore / 30) * 100}%` }}></div>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">{liveScore.tenureTier}</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">총경력 배점</span>
                  <span className="font-bold text-purple-600">{liveScore.expScore} / 40점</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full transition-all duration-300" style={{ width: `${(liveScore.expScore / 40) * 100}%` }}></div>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">{liveScore.expTier}</span>
              </div>
            </div>
          </div>

          {/* 저장하기 버튼 */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-500/20 transition flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Firestore 저장 중...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>저장하기 (Firestore rotation_records)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* [요구사항 핵심] 저장 완료 후 화면 하단에 표시되는 총 배점점수 리포트 카드 */}
      {savedResult && (
        <div id="saved-score-banner" className="transition-all duration-500 transform animate-in fade-in-50">
          <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-brand-500/25 relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-indigo-400/20 blur-xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* 좌측 안내 정보 */}
              <div className="text-center md:text-left space-y-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                  <span>Firestore rotation_records 컬렉션 영구 저장 완료</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  <span className="underline decoration-brand-300 underline-offset-4">{savedResult.name}</span> 님의 총 배점 결과
                </h3>
                
                <p className="text-brand-100 text-xs sm:text-sm max-w-md">
                  {savedResult.affiliation} 소속 · 만 {savedResult.age}세 · 재직 {savedResult.tenure}년 ({formatYearMonthDisplay(savedResult.tenure)}) · 총경력 {savedResult.totalExp}년 ({formatYearMonthDisplay(savedResult.totalExp)})
                </p>

                <div className="pt-2 text-xs text-brand-200">
                  평정 저장일시: <strong className="text-white">{savedResult.savedAt}</strong>
                </div>
              </div>

              {/* 우측 총점 배지 및 점수 강조 */}
              <div className="flex flex-col items-center justify-center bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/25 min-w-[240px] text-center shadow-lg">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-100">
                  나의 총 배점점수
                </span>

                <div className="flex items-baseline justify-center space-x-1 my-2">
                  <span className="text-6xl font-black tracking-tight text-white drop-shadow-md">
                    {savedResult.scoreBreakdown.totalScore}
                  </span>
                  <span className="text-xl font-bold text-brand-200">/ 100점</span>
                </div>

                {/* 구간별 세부 점수 칩 */}
                <div className="grid grid-cols-3 gap-1.5 w-full mt-1 pt-3 border-t border-white/20 text-xs">
                  <div className="bg-black/20 py-1.5 px-2 rounded-lg">
                    <span className="opacity-75 block text-[10px]">나이</span>
                    <strong className="text-white">{savedResult.scoreBreakdown.ageScore}점</strong>
                  </div>
                  <div className="bg-black/20 py-1.5 px-2 rounded-lg">
                    <span className="opacity-75 block text-[10px]">재직</span>
                    <strong className="text-white">{savedResult.scoreBreakdown.tenureScore}점</strong>
                  </div>
                  <div className="bg-black/20 py-1.5 px-2 rounded-lg">
                    <span className="opacity-75 block text-[10px]">경력</span>
                    <strong className="text-white">{savedResult.scoreBreakdown.expScore}점</strong>
                  </div>
                </div>

                <div className="mt-3 text-[11px] font-bold text-emerald-300 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  <span>
                    {savedResult.scoreBreakdown.totalScore >= 80
                      ? '★ 최우선 순환배치군 (80점 이상)'
                      : savedResult.scoreBreakdown.totalScore >= 60
                      ? '● 정기 순환 권장군 (60~79점)'
                      : '○ 일반 검토군 (60점 미만)'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 배점 기준표 모달 */}
      {showBenchmarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-brand-600" />
                <h4 className="font-bold text-slate-900 text-base">순환보직 평정 구간 배점표 (100점 만점)</h4>
              </div>
              <button
                onClick={() => setShowBenchmarkModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              사내 인사 규정 및 엑셀 시트 배점표 수치에 맞춰 자유롭게 커스터마이징 가능한 기준표입니다.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100">
                <span className="font-bold text-brand-900 block mb-1.5">1. 나이 배점 (최대 30점)</span>
                <div className="grid grid-cols-2 gap-1 text-slate-600">
                  <span>• 55세 이상: <strong>30점</strong></span>
                  <span>• 50~54세: <strong>25점</strong></span>
                  <span>• 45~49세: <strong>20점</strong></span>
                  <span>• 40~44세: <strong>15점</strong></span>
                  <span>• 40세 미만: <strong>10점</strong></span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <span className="font-bold text-indigo-900 block mb-1.5">2. 재직기간 배점 (최대 30점)</span>
                <div className="grid grid-cols-2 gap-1 text-slate-600">
                  <span>• 10년 이상: <strong>30점</strong></span>
                  <span>• 5~9년: <strong>20점</strong></span>
                  <span>• 1~4년: <strong>10점</strong></span>
                  <span>• 1년 미만: <strong>0점</strong></span>
                </div>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <span className="font-bold text-purple-900 block mb-1.5">3. 총경력 배점 (최대 40점)</span>
                <div className="grid grid-cols-2 gap-1 text-slate-600">
                  <span>• 20년 이상: <strong>40점</strong></span>
                  <span>• 10~19년: <strong>30점</strong></span>
                  <span>• 5~9년: <strong>20점</strong></span>
                  <span>• 5년 미만: <strong>10점</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowBenchmarkModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
