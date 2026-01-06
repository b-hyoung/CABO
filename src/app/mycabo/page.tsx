"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from 'next/navigation';

import { DeveloperData, Tab, CodeQualityData, CollaborationData } from "@/app/types";
import ActivityAnalysisTab from "./components/ActivityAnalysisTab";
import CodeQualityTab from "./components/CodeQualityTab";
import CollaborationStyleTab from "./components/CollaborationStyleTab";
import ProfileCard from "./components/ProfileCard";
import Badges from "./components/Badges";
import AdditionalStats from "./components/AdditionalStats";
import ShareModal from './components/ShareModal';
import { getPrStyleProfile } from './components/collaborationUtils';


// --- Main Page Component ---
export default function MyCaboPage() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username');
  const method = searchParams.get('method');

  // State for initial developer data (Activity Tab)
  const [developer, setDeveloper] = useState<DeveloperData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for other tabs
  const [qualityData, setQualityData] = useState<CodeQualityData | null>(null);
  const [collaborationData, setCollaborationData] = useState<CollaborationData | null>(null);
  
  const [isQualityLoading, setIsQualityLoading] = useState(false);
  const [qualityError, setQualityError] = useState<string | null>(null);

  const [isCollaborationLoading, setIsCollaborationLoading] = useState(false);
  const [collaborationError, setCollaborationError] = useState<string | null>(null);

  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('activity');

  // State for Share Modal & Dynamic Description
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [dynamicTraits, setDynamicTraits] = useState<string[]>([]);


  useEffect(() => {
    // Ensure window is defined (runs only on client)
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // ... (caching and data fetching functions remain the same) ...

  // --- Dynamic Description Generation ---
  useEffect(() => {
    if (developer && qualityData && collaborationData) {
        const traits: string[] = [];

        // 1. Activity Trait
        const activityPersona = developer.stats.consistency;
        if (activityPersona.includes("마라토너")) traits.push("#꾸준한_활동가");
        else if (activityPersona.includes("주말")) traits.push("#주말_집중");
        else if (activityPersona.includes("올빼미")) traits.push("#새벽반");
        else if (activityPersona.includes("오전형")) traits.push("#아침형_개발자");

        // 2. Quality Trait
        const topQualityScore = qualityData.scores.reduce(
          (max, score) => (score.score > max.score ? score : max),
          qualityData.scores[0] || { subject: '', score: 0 }
        );
        if (topQualityScore.score > 80) {
             switch (topQualityScore.subject) {
                case '작업분할': traits.push("#ATOMIC_커밋"); break;
                case '의미도': traits.push("#클린_커밋"); break;
                case '구조화': traits.push("#체계적인_관리"); break;
            }
        }
        
        // 3. Collaboration Trait
        const teamRepoAnalysis = collaborationData.repoAnalyses.find(r => r.classification === 'Team');
        if (teamRepoAnalysis) {
            const collabProfile = getPrStyleProfile(teamRepoAnalysis.metrics);
            if(collabProfile.persona !== "정보 부족") {
                traits.push(`#${collabProfile.persona.replace(/\s/g, '_')}`);
            }
        }

        // Ensure we have at least one trait, or a default one
        if (traits.length === 0) {
            traits.push("#탐색중");
        }

        setDynamicTraits(traits.slice(0, 3)); // Max 3 traits
    }
  }, [developer, qualityData, collaborationData]);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
  };


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <p className="text-2xl text-black dark:text-white animate-pulse">데이터를 분석하는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">
          <p className="text-2xl text-red-500">오류가 발생했습니다</p>
          <p className="text-md text-zinc-600 dark:text-zinc-400 mt-2">{error}</p>
          <Link href="/" className="mt-4 inline-block rounded-full bg-blue-600 px-5 py-2 text-lg font-semibold text-white transition-colors hover:bg-blue-700">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!developer) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
         <p className="text-xl text-black dark:text-zinc-50">개발자 정보를 찾을 수 없습니다.</p>
       </div>
    );
  }

  return (
    <div className="flex min-h-screen items-stretch justify-center bg-zinc-50 font-sans dark:bg-black py-12 sm:py-16">
      <main id="report-content" className="flex w-full max-w-4xl flex-col items-center gap-10 px-4 sm:px-8 flex-grow">
        <header className="w-full flex justify-between items-center no-print">
          <Link href="/" className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800">
            &larr; 다시 분석하기
          </Link>
          <h1 className="hidden sm:block text-2xl font-bold text-black dark:text-zinc-50">
            개발자 분석 리포트
          </h1>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            리포트 공유하기
          </button>
        </header>

        <ProfileCard developer={developer} traits={dynamicTraits} />

        <section className="w-full">
          <div className="mb-4 border-b border-zinc-200 dark:border-zinc-700 no-print">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => handleTabClick('activity')}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-base font-medium ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                활동 분석
              </button>
              <button
                onClick={() => handleTabClick('quality')}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-base font-medium ${
                  activeTab === 'quality'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                코드 품질
              </button>
              <button
                onClick={() => handleTabClick('communication')}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-base font-medium ${
                  activeTab === 'communication'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                협업 스타일
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'activity' && (
              <div className="space-y-10">
                <ActivityAnalysisTab developer={developer} isTooltipVisible={isTooltipVisible} setIsTooltipVisible={setIsTooltipVisible} method={method} />
                <AdditionalStats stats={developer.stats} />
                <Badges developer={developer} />
              </div>
            )}
            {activeTab === 'quality' && (
              <CodeQualityTab 
                qualityData={qualityData}
                isLoading={isQualityLoading}
                error={qualityError}
              />
            )}
            {activeTab === 'communication' && (
              <CollaborationStyleTab 
                collaborationData={collaborationData}
                isLoading={isCollaborationLoading}
                error={collaborationError}
              />
            )}
          </div>
        </section>

        <footer className="w-full text-center mt-auto pt-8 border-t border-zinc-200 dark:border-zinc-700 no-print">
          <p className="text-md text-zinc-500 dark:text-zinc-400">
            이 분석은 AI에 의해 생성되었으며, 참고용으로만 활용해주세요.
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            &copy; 2025 CABO. All rights reserved.
          </p>
        </footer>
      </main>

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        reportUrl={currentUrl}
        username={username || 'user'}
      />
    </div>
  );
}