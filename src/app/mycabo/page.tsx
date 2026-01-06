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

  // --- Caching and Data Fetching ---
  const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 1 week

  const getDeveloperData = useCallback(async () => {
    if (!username) {
      setError("GitHub 사용자 이름이 URL에 필요합니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 1. Check cache first
    try {
      const cachedItem = localStorage.getItem(`cabo-dev-${username}`);
      if (cachedItem) {
        const { data, timestamp } = JSON.parse(cachedItem);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setDeveloper(data);
          setIsLoading(false);
          return; // Use cached data
        }
      }
    } catch (e) {
      console.error("캐시를 불러오는 데 실패했습니다:", e);
    }

    // 2. If no valid cache, fetch from API
    try {
      const res = await fetch(`/api/github/user/${username}?method=${method || 'pinned'}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "사용자 데이터를 불러오는데 실패했습니다.");
      }
      const data: DeveloperData = await res.json();
      setDeveloper(data);
      // 3. Save to cache
      localStorage.setItem(`cabo-dev-${username}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [username, method]);

  useEffect(() => {
    getDeveloperData();
  }, [getDeveloperData]);
  
  const fetchQualityData = useCallback(async () => {
    if (!username || qualityData) return;
    setIsQualityLoading(true);
    setQualityError(null);
    try {
      const cachedItem = localStorage.getItem(`cabo-quality-${username}`);
      if (cachedItem) {
        const { data, timestamp } = JSON.parse(cachedItem);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setQualityData(data);
          setIsQualityLoading(false);
          return;
        }
      }
      const res = await fetch(`/api/github/user/${username}/code_quality?method=${method || 'recent'}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "코드 품질 데이터를 불러오는 데 실패했습니다.");
      }
      const data: CodeQualityData = await res.json();
      setQualityData(data);
      localStorage.setItem(`cabo-quality-${username}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e: any) {
      setQualityError(e.message);
    } finally {
      setIsQualityLoading(false);
    }
  }, [username, method, qualityData]);

  const fetchCollaborationData = useCallback(async () => {
    if (!username || collaborationData) return;
    setIsCollaborationLoading(true);
    setCollaborationError(null);
    try {
      const cachedItem = localStorage.getItem(`cabo-collab-${username}`);
      if (cachedItem) {
        const { data, timestamp } = JSON.parse(cachedItem);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setCollaborationData(data);
setIsCollaborationLoading(false);
          return;
        }
      }
      const res = await fetch(`/api/github/user/${username}/collaboration_style?method=pinned`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "협업 스타일 데이터를 불러오는 데 실패했습니다.");
      }
      const data: CollaborationData = await res.json();
      setCollaborationData(data);
      localStorage.setItem(`cabo-collab-${username}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e: any) {
      setCollaborationError(e.message);
    } finally {
      setIsCollaborationLoading(false);
    }
  }, [username, collaborationData]);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'quality') {
      fetchQualityData();
    } else if (tab === 'communication') {
      fetchCollaborationData();
    }
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
      <main className="flex w-full max-w-4xl flex-col items-center gap-10 px-4 sm:px-8 flex-grow">
        <header className="w-full flex justify-between items-center">
          <Link href="/" className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800">
            &larr; 다시 분석하기
          </Link>
          <h1 className="hidden sm:block text-2xl font-bold text-black dark:text-zinc-50">
            개발자 분석 리포트
          </h1>
          <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
            리포트 공유하기
          </button>
        </header>

        <ProfileCard developer={developer} />

        <section className="w-full">
          <div className="mb-4 border-b border-zinc-200 dark:border-zinc-700">
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

        <footer className="w-full text-center mt-auto pt-8 border-t border-zinc-200 dark:border-zinc-700">
          <p className="text-md text-zinc-500 dark:text-zinc-400">
            이 분석은 AI에 의해 생성되었으며, 참고용으로만 활용해주세요.
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            &copy; 2025 CABO. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}