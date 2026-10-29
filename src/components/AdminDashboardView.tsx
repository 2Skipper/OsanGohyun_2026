/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle, Award, CheckCircle2, Download, Eye, FileSpreadsheet, KeyRound, Lock, Search, ShieldCheck, Trash2, Users, X } from 'lucide-react';
import { CareerRecord } from '../types.ts';
import { formatYearMonthDisplay } from '../utils/scoreCalculator.ts';

interface AdminDashboardViewProps {
  careerRecords: CareerRecord[];
  onDeleteRecord: (recordId: string) => void;
  adminPassword?: string;
  onChangeAdminPassword?: (newPassword: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  careerRecords,
  onDeleteRecord,
  adminPassword = '112233',
  onChangeAdminPassword
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<CareerRecord | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<CareerRecord | null>(null);

  // [요구사항 핵심 3] 관리자 비밀번호 변경 팝업 모달 상태
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [currentPw, setCurrentPw] = useState<string>('');
  const [newPw, setNewPw] = useState<string>('');
  const [newPwConfirm, setNewPwConfirm] = useState<string>('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const handleOpenPwModal = () => {
    setCurrentPw('');
    setNewPw('');
    setNewPwConfirm('');
    setPwError(null);
    setPwSuccess(null);
    setShowPasswordModal(true);
  };

  const handleClosePwModal = () => {
    setShowPasswordModal(false);
    setCurrentPw('');
    setNewPw('');
    setNewPwConfirm('');
    setPwError(null);
    setPwSuccess(null);
  };

  const handleSubmitChangePw = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    const activeAdminPw = adminPassword || '112233';

    if (!currentPw) {
      setPwError('이전 비밀번호를 입력해 주세요.');
      return;
    }
    if (currentPw !== activeAdminPw) {
      setPwError('이전 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!newPw) {
      setPwError('새로운 비밀번호를 입력해 주세요.');
      return;
    }
    if (newPw.length < 4) {
      setPwError('새로운 비밀번호는 4자 이상 입력해 주세요.');
      return;
    }
    if (newPw !== newPwConfirm) {
      setPwError('새로운 비밀번호와 확인 입력이 일치하지 않습니다. 2번 반복하여 정확히 입력해 주세요.');
      return;
    }

    if (onChangeAdminPassword) {
      onChangeAdminPassword(newPw);
    }
    setPwSuccess('관리자 비밀번호가 성공적으로 변경되었습니다!');
    setTimeout(() => {
      handleClosePwModal();
    }, 1200);
  };

  // 배점 기준 내림차순 정렬
  const sortedRecords = [...careerRecords]
    .filter(
      (r) =>
        r.name.includes(searchTerm) ||
        r.affiliation.includes(searchTerm) ||
        r.currentDuties.includes(searchTerm)
    )
    .sort((a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore);

  // KPI 통계 계산
  const totalCount = careerRecords.length;
  const topScore = careerRecords.length > 0
    ? Math.max(...careerRecords.map((r) => r.scoreBreakdown.totalScore))
    : 0;
  const avgScore = careerRecords.length > 0
    ? (careerRecords.reduce((acc, c) => acc + c.scoreBreakdown.totalScore, 0) / careerRecords.length).toFixed(1)
    : '0';
  const priorityCount = careerRecords.filter((r) => r.scoreBreakdown.totalScore >= 70).length;

  // 엑셀 CSV 다운로드
  const handleExportCSV = () => {
    const headers = ['순위', '성명', '소속(학년/반)', '나이', '재직기간(년)', '총경력(년)', '나이배점', '재직배점', '경력배점', '총배점점수', '올해업무', '등록일시'];
    const rows = sortedRecords.map((r, i) => [
      i + 1,
      `"${r.name}"`,
      `"${r.affiliation}"`,
      r.age,
      r.tenure,
      r.totalExp,
      r.scoreBreakdown.ageScore,
      r.scoreBreakdown.tenureScore,
      r.scoreBreakdown.expScore,
      r.scoreBreakdown.totalScore,
      `"${r.currentDuties.replace(/"/g, '""')}"`,
      `"${r.savedAt}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rotation_score_records_${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* 상단 관리자 타이틀 및 액션 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              관리자 모드 (인사팀 / 교무부)
            </span>
            <span className="text-xs text-slate-400">Firestore rotation_records 연동</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">직원 경력 정보 및 순환 배점 관리 대시보드</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            등록된 임직원의 나이·재직·경력 종합 평정 배점을 실시간 집계 및 분석합니다.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenPwModal}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center shadow-xs cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
            <span>관리자 비밀번호 변경</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>엑셀 CSV 내보내기</span>
          </button>
        </div>
      </div>

      {/* KPI 통계 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">총 평정 인원</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}명</div>
          <span className="text-[11px] text-slate-500 mt-1 block">rotation_records 집계</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">최고 평정 점수</span>
          <div className="text-2xl font-black text-brand-600 mt-1">{topScore}점</div>
          <span className="text-[11px] text-brand-600/80 mt-1 block">100점 만점 기준</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">전체 평균 배점</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{avgScore}점</div>
          <span className="text-[11px] text-indigo-500 mt-1 block">표준 배점 분포</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">우선 순환군 (70점 이상)</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{priorityCount}명</div>
          <span className="text-[11px] text-emerald-600 mt-1 block">정기 순환 우선 대상</span>
        </div>
      </div>

      {/* 메인 배점 순위 집계 테이블 */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">직원 경력 정보 및 순환 배점 집계표</h3>
            <p className="text-xs text-slate-500">배점 기준(나이 30 + 재직 30 + 총경력 40 = 100점) 내림차순 정렬</p>
          </div>

          {/* 상단 툴바: 선택 삭제 버튼 & 검색 바 */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={!selectedRecordId}
              onClick={() => {
                const target = sortedRecords.find((r) => r.id === selectedRecordId);
                if (target) setRecordToDelete(target);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 select-none ${
                selectedRecordId
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25 cursor-pointer scale-[1.01]'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
              }`}
              title={selectedRecordId ? "선택한 교직원 데이터 및 로그인 계정 영구 삭제" : "목록의 라디오 버튼으로 대상을 먼저 선택하세요"}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>선택 삭제 (로그인 계정 포함)</span>
            </button>

            {/* 검색 바 */}
            <div className="relative min-w-[220px]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="이름, 소속, 업무 키워드 검색..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-3.5 text-center w-12">선택</th>
                <th className="px-5 py-3.5">순위</th>
                <th className="px-5 py-3.5">이름 / 소속</th>
                <th className="px-5 py-3.5">경력 스펙</th>
                <th className="px-5 py-3.5">배점 구성 (나이 / 재직 / 경력)</th>
                <th className="px-5 py-3.5 text-center">총 배점점수</th>
                <th className="px-5 py-3.5">올해 업무</th>
                <th className="px-5 py-3.5 text-right">관리 작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    등록된 평정 기록이 없습니다.
                  </td>
                </tr>
              ) : (
                sortedRecords.map((record, index) => {
                  const total = record.scoreBreakdown.totalScore;
                  let badgeClass = "bg-slate-100 text-slate-700";
                  if (total >= 80) badgeClass = "bg-purple-100 text-purple-700 font-extrabold";
                  else if (total >= 65) badgeClass = "bg-emerald-100 text-emerald-700 font-bold";
                  else badgeClass = "bg-amber-100 text-amber-700";

                  const isSelected = selectedRecordId === record.id;

                  return (
                    <tr
                      key={record.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-rose-50/60' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* 라디오 버튼 선택 열 */}
                      <td className="px-3.5 py-4 text-center">
                        <input
                          type="radio"
                          name="adminEmployeeSelection"
                          checked={isSelected}
                          onChange={() => setSelectedRecordId(record.id)}
                          className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                          title="삭제할 교직원 선택"
                        />
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-400">
                        {index + 1}위
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{record.name}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{record.affiliation}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div>만 {record.age}세 · 재직 {formatYearMonthDisplay(record.tenure)}</div>
                        <div className="text-[11px] text-slate-400">총경력 {formatYearMonthDisplay(record.totalExp)}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-1.5 font-medium">
                          <span className="text-brand-700">나이 {record.scoreBreakdown.ageScore}</span>
                          <span className="text-slate-300">+</span>
                          <span className="text-indigo-700">재직 {record.scoreBreakdown.tenureScore}</span>
                          <span className="text-slate-300">+</span>
                          <span className="text-purple-700">경력 {record.scoreBreakdown.expScore}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {record.scoreBreakdown.ageTier} · {record.scoreBreakdown.tenureTier}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs ${badgeClass}`}>
                          {total}점
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-xs text-slate-600 truncate" title={record.currentDuties}>
                        {record.currentDuties}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(record)}
                            className="px-2.5 py-1 border border-slate-200 hover:border-brand-300 bg-white rounded-lg text-slate-700 font-medium text-[11px] inline-flex items-center transition cursor-pointer"
                            title="평정 상세 내역 보기"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            <span>상세</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecordToDelete(record)}
                            className="px-2.5 py-1 border border-rose-200 hover:border-rose-400 hover:bg-rose-50 bg-white rounded-lg text-rose-600 font-bold text-[11px] inline-flex items-center transition cursor-pointer"
                            title="평정 기록 및 로그인 계정 영구 삭제"
                          >
                            <Trash2 className="w-3 h-3 mr-1 text-rose-600" />
                            <span>삭제</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 개별 직원 평정 상세 모달 */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-brand-600 font-bold">평정 상세 리포트</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedRecord.name} ({selectedRecord.affiliation})</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* 총점 배지 */}
            <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-xl p-4 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-brand-100 block">종합 순환보직 평정점수</span>
                <span className="text-3xl font-black">{selectedRecord.scoreBreakdown.totalScore}점</span>
                <span className="text-xs text-brand-200"> / 100점 만점</span>
              </div>
              <div className="text-right text-xs space-y-0.5">
                <div>나이 배점: <strong>{selectedRecord.scoreBreakdown.ageScore}점</strong> ({selectedRecord.scoreBreakdown.ageTier})</div>
                <div>재직 배점: <strong>{selectedRecord.scoreBreakdown.tenureScore}점</strong> ({selectedRecord.scoreBreakdown.tenureTier})</div>
                <div>총경력 배점: <strong>{selectedRecord.scoreBreakdown.expScore}점</strong> ({selectedRecord.scoreBreakdown.expTier})</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div>
                <span className="font-bold text-slate-500 block">올해 담당 업무:</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 mt-1 leading-relaxed">
                  {selectedRecord.currentDuties}
                </p>
              </div>
              <div className="text-slate-400 text-[11px] pt-1">
                평정 저장일시: {selectedRecord.savedAt}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* [요구사항 핵심] 평정 기록 및 로그인 계정 동시 삭제 확인 모달 */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center font-bold">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                평정 데이터 & 로그인 정보 영구 삭제
              </h3>
              <p className="text-xs text-slate-500">
                선택하신 교직원의 평정 기록과 로그인 계정 정보를 한꺼번에 삭제합니다.
              </p>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-left space-y-2 text-xs text-rose-950 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-rose-700">교직원 이름:</span>
                  <span className="font-bold text-slate-900 text-sm">{recordToDelete.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-rose-700">소속(학년/반):</span>
                  <span className="font-bold text-slate-800">{recordToDelete.affiliation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-rose-700">총 배점 점수:</span>
                  <span className="font-black text-rose-600">{recordToDelete.scoreBreakdown.totalScore}점</span>
                </div>
                <div className="pt-2 border-t border-rose-200/80 text-[11px] text-rose-700 font-medium leading-relaxed">
                  ⚠️ <strong>주의:</strong> 삭제 실행 시 Firestore의 <code className="bg-white px-1 py-0.5 rounded border border-rose-200 font-bold">rotation_records</code> 평정 데이터뿐만 아니라 <code className="bg-white px-1 py-0.5 rounded border border-rose-200 font-bold">users</code> 로그인 계정 정보까지 한꺼번에 완전 삭제되며 복구할 수 없습니다.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteRecord(recordToDelete.id);
                  if (selectedRecordId === recordToDelete.id) {
                    setSelectedRecordId(null);
                  }
                  setRecordToDelete(null);
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black rounded-xl text-xs transition shadow-md shadow-rose-500/25 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>영구 삭제 실행</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* [요구사항 핵심 3] 관리자 비밀번호 변경 팝업 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            
            {/* 상단 닫기 버튼 및 아이콘 */}
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                <KeyRound className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={handleClosePwModal}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 타이틀 및 설명 */}
            <div>
              <h3 className="text-lg font-black text-slate-900">관리자 비밀번호 변경</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                현재 관리자 비밀번호를 확인한 후, 새로운 비밀번호를 2번 반복하여 입력해 주세요.
              </p>
            </div>

            {/* 에러 및 성공 피드백 알림 */}
            {pwError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{pwError}</span>
              </div>
            )}
            {pwSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{pwSuccess}</span>
              </div>
            )}

            {/* 비밀번호 변경 폼 */}
            <form onSubmit={handleSubmitChangePw} className="space-y-3.5 pt-1">
              
              {/* 1. 이전 비밀번호 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  이전 비밀번호 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="현재 관리자 비밀번호를 입력하세요"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden transition"
                    autoFocus
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* 2. 새로운 비밀번호 (1차 입력) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  새로운 비밀번호 <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="새로운 비밀번호를 입력하세요 (4자 이상)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden transition"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* 3. 새로운 비밀번호 확인 (2차 입력) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    새로운 비밀번호 확인 <span className="text-rose-500">*</span>
                  </label>
                  {newPwConfirm && newPw === newPwConfirm && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" /> 일치함
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={newPwConfirm}
                    onChange={(e) => setNewPwConfirm(e.target.value)}
                    placeholder="새로운 비밀번호를 한 번 더 입력하세요"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden transition"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* 하단 버튼 2개: 취소 & 변경하기 */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClosePwModal}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-black rounded-xl text-xs transition shadow-md shadow-purple-500/25 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>변경하기</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
