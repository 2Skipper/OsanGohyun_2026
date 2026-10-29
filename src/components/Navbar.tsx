/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Code, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { UserRole } from '../types.ts';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: { name: string; affiliation: string; role: UserRole } | null;
  onSignOut: () => void;
  onOpenSkeletonModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onSignOut,
  onOpenSkeletonModal,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* 로고 & 타이틀 */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => onNavigate('login')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">순환보직 평정 시스템</span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[11px] font-semibold bg-brand-50 text-brand-700 rounded-full border border-brand-200">
              경력 배점 평가
            </span>
          </div>
        </div>

        {/* 네비게이션 탭 (희망 보직 신청 제외됨) */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => onNavigate('login')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              currentView === 'login'
                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            로그인 / 가입
          </button>

          <button
            onClick={() => onNavigate('career')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              currentView === 'career'
                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-brand-600" />
            <span>경력 정보 & 배점 입력</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              currentView === 'admin'
                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>관리자 대시보드</span>
          </button>
        </nav>

        {/* 우측 유저 배지 & 단일 HTML 코드 모달 버튼 */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenSkeletonModal}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center shadow-xs transition"
            title="단일 HTML 파일 스켈레톤 코드 보기 및 다운로드"
          >
            <Code className="w-3.5 h-3.5 mr-1 text-brand-300" />
            <span className="hidden sm:inline">단일 HTML 스켈레톤</span>
            <span className="sm:hidden">스켈레톤</span>
          </button>

          {currentUser ? (
            <div className="flex items-center space-x-2 bg-slate-100 pl-3 pr-2 py-1 rounded-full border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded-full border border-slate-200">
                {currentUser.role === 'admin' ? '관리자' : '직원'}
              </span>
              <button
                onClick={onSignOut}
                className="text-slate-400 hover:text-rose-600 p-1 transition"
                title="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className="text-xs font-semibold text-brand-600 hover:underline px-2 py-1"
            >
              로그인
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
