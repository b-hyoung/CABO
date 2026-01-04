"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';

import { DeveloperData, Tab } from "@/app/types";
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

  const [developer, setDeveloper] = useState<DeveloperData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('activity');

  useEffect(() => {
    if (!username) {
      setError("GitHub 사용자 이름이 URL에 필요합니다.");
      setIsLoading(false);
      return;
    }
    async function getDeveloperData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/github/user/${username}?method=${method || 'pinned'}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "사용자 데이터를 불러오는데 실패했습니다.");
        }
        const data: DeveloperData = await res.json();
        setDeveloper(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }
    getDeveloperData();
  }, [username, method]);

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
                onClick={() => setActiveTab('activity')}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-base font-medium ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                활동 분석
              </button>
              <button
                onClick={() => setActiveTab('quality')}
                className={`whitespace-nowrap border-b-2 py-4 px-1 text-base font-medium ${
                  activeTab === 'quality'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                코드 품질
              </button>
              <button
                onClick={() => setActiveTab('communication')}
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
              <ActivityAnalysisTab developer={developer} isTooltipVisible={isTooltipVisible} setIsTooltipVisible={setIsTooltipVisible} method={method} />
            )}
            {activeTab === 'quality' && (
              <CodeQualityTab developer={developer} />
            )}
            {activeTab === 'communication' && (
              <CollaborationStyleTab developer={developer} />
            )}
          </div>
        </section>

        <AdditionalStats stats={developer.stats} />

        <Badges developer={developer} />

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