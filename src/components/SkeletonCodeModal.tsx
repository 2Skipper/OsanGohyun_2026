/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Check, Copy, Download, ExternalLink, Eye, FileCode2 } from 'lucide-react';
import { SKELETON_HTML_CODE } from '../data/skeletonCode.ts';

interface SkeletonCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkeletonCodeModal: React.FC<SkeletonCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SKELETON_HTML_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([SKELETON_HTML_CODE], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'job-rotation-system-skeleton.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* 헤더 */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                단일 HTML 파일 스켈레톤 (HTML + Tailwind + Vanilla JS + Firebase CDN)
              </h3>
              <p className="text-xs text-slate-500">
                Phase 1(로그인/회원가입/admin) + Phase 2(경력 정보 입력 & calculateScore 배점) 완비
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
          >
            ✕
          </button>
        </div>

        {/* 탭 및 복사/다운로드 툴바 */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                activeTab === 'code' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              소스 코드 보기
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                activeTab === 'preview' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              실시간 iframe 미리보기
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  <span>전체 코드 복사</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold flex items-center transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              <span>.html 다운로드</span>
            </button>
          </div>
        </div>

        {/* 컨텐츠 뷰 */}
        <div className="flex-1 overflow-auto bg-slate-900 text-slate-100 p-4 font-mono text-xs">
          {activeTab === 'code' ? (
            <pre className="whitespace-pre overflow-x-auto leading-relaxed select-all">
              {SKELETON_HTML_CODE}
            </pre>
          ) : (
            <iframe
              src="/single_page_skeleton.html"
              title="Single Page Skeleton Preview"
              className="w-full h-full bg-white rounded-lg border-0"
            />
          )}
        </div>

      </div>
    </div>
  );
};
