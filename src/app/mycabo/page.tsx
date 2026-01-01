"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';

interface DeveloperData {
  name: string;
  githubHandle: string;
  avatarUrl: string;
  tier: string;
  tierColor: string;
  tierIcon: string;
  tierDescription: string;
  stats: {
    consistency: string;
    commitFrequency: string;
    codeQualityScore: number;
    maintainability: string;
    communicationScore: number;
    teamworkStyle: string;
  };
  languages: { name: string; percentage: number; color: string }[];
  badges: { name: string; description: string; icon: string }[];
}

export default function MyCaboPage() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username');
  const method = searchParams.get('method');

  const [developer, setDeveloper] = useState<DeveloperData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // Pass the selected method as a query parameter to the API
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
        {/* Header */}
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

        {/* Developer Tier Card Section */}
        <section className="w-full rounded-2xl bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Left side: Avatar and Info */}
            <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-8">
              <div className="relative flex-shrink-0">
                 <Image src={developer.avatarUrl} alt="Developer Avatar" width={128} height={128} className="rounded-full border-4 border-white dark:border-zinc-700 shadow-md" />
                 <span className="absolute bottom-1 right-1 text-4xl">{developer.tierIcon}</span>
              </div>
              <div className="flex flex-col items-center sm:items-start gap-2">
                <h2 className="text-4xl font-extrabold text-black dark:text-white">{developer.name}</h2>
                <p className="text-lg text-zinc-500 dark:text-zinc-400">@{developer.githubHandle}</p>
                <div className={`mt-4 rounded-full px-4 py-1.5 text-lg font-bold ${developer.tierColor} bg-blue-100 dark:bg-blue-900/50`}>
                  {developer.tier} Tier
                </div>
                <p className="mt-2 text-center sm:text-left text-zinc-600 dark:text-zinc-300">{developer.tierDescription}</p>
              </div>
            </div>

            {/* Right side: Top Languages */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-black dark:text-white text-center md:text-left">주요 사용 언어</h3>
              <div className="space-y-3">
                {developer.languages && developer.languages.map(lang => (
                  <div key={lang.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-base font-medium text-zinc-700 dark:text-zinc-300">{lang.name}</span>
                      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{lang.percentage}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 rounded-full h-2.5 dark:bg-zinc-700">
                      <div className="h-2.5 rounded-full" style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Analysis Section */}
        <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ghost Detector */}
          <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md">
            <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white">
              <span className="text-2xl">📉</span> 잠수함 탐지
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">커밋 주기와 시간대를 분석하여 성실성을 파악합니다.</p>
            <div className="mt-auto space-y-3 pt-4">
              <div className="text-center rounded-lg bg-zinc-100 dark:bg-zinc-700 p-3">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">활동 유형</p>
                <p className="text-lg font-bold text-black dark:text-white">{developer.stats.consistency}</p>
              </div>
              <div className="text-center rounded-lg bg-zinc-100 dark:bg-zinc-700 p-3">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">커밋 빈도</p>
                <p className="text-lg font-bold text-black dark:text-white">{developer.stats.commitFrequency}</p>
              </div>
            </div>
          </div>

          {/* Code Quality */}
          <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md">
            <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white">
              <span className="text-2xl">🧹</span> 코드 청결도
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">AI가 코드 품질을 분석하여 유지보수성을 측정합니다.</p>
            <div className="mt-auto space-y-3 pt-4">
              <div className="text-center rounded-lg bg-zinc-100 dark:bg-zinc-700 p-3">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">품질 점수</p>
                <p className="text-lg font-bold text-black dark:text-white">{developer.stats.codeQualityScore} / 100</p>
              </div>
              <div className="text-center rounded-lg bg-zinc-100 dark:bg-zinc-700 p-3">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">유지보수성</p>
                <p className="text-lg font-bold text-black dark:text-white">{developer.stats.maintainability}</p>
              </div>
            </div>
          </div>

          {/* Communication Style */}
          <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md">
            <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white">
              <span className="text-2xl">🗣️</span> 협업 매너
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">PR, Issue의 코멘트를 분석하여 협업 스타일을 진단합니다.</p>
             <div className="mt-auto space-y-3 pt-4">
              <div className="text-center rounded-lg bg-zinc-100 dark:bg-zinc-700 p-3">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">팀워크 점수</p>
                <p className="text-lg font-bold text-black dark:text-white">{developer.stats.communicationScore} / 100</p>
              </div>
              <div className="text-center rounded-lg bg-zinc-100 dark:bg-zinc-700 p-3">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">소통 스타일</p>
                <p className="text-lg font-bold text-black dark:text-white">{developer.stats.teamworkStyle}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section className="w-full">
          <h3 className="text-2xl font-bold text-black dark:text-white mb-4">획득 뱃지</h3>
          <div className="flex flex-wrap gap-4">
            {developer.badges && developer.badges.map(badge => (
              <div key={badge.name} className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-white dark:bg-zinc-800 shadow-md w-36">
                <span className="text-5xl p-2 bg-zinc-100 dark:bg-zinc-700 rounded-full">{badge.icon}</span>
                <p className="font-bold text-black dark:text-white">{badge.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{badge.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
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