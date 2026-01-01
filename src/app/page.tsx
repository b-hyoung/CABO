"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Modal Component
const AnalysisMethodModal = ({ onSelect, onClose }: { onSelect: (method: 'pinned' | 'recent') => void; onClose: () => void; }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-800" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-black dark:hover:text-white">&times;</button>
        <h2 className="text-2xl font-bold text-black dark:text-white">분석 기준 선택</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">어떤 리포지토리를 기준으로 분석할까요?</p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            onClick={() => onSelect('pinned')}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border p-6 text-center transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
          >
            <span className="text-3xl">📌</span>
            <span className="font-semibold text-black dark:text-white">고정된 리포지토리</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">프로필에 고정한 대표 프로젝트</span>
          </button>
          <button
            onClick={() => onSelect('recent')}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border p-6 text-center transition-all hover:border-green-500 hover:bg-green-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
          >
            <span className="text-3xl">⏱️</span>
            <span className="font-semibold text-black dark:text-white">최근 활동 리포지토리</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">가장 최근에 작업한 프로젝트</span>
          </button>
        </div>
      </div>
    </div>
  );
};


export default function Home() {
  const [githubUrl, setGithubUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const router = useRouter();

  const openAnalysisModal = () => {
    if (!githubUrl) {
      alert("GitHub URL을 입력해주세요.");
      return;
    }

    const urlParts = githubUrl.split('/');
    let extractedUsername = '';
    for (let i = urlParts.length - 1; i >= 0; i--) {
      if (urlParts[i].trim() !== '') {
        extractedUsername = urlParts[i];
        break;
      }
    }
    
    if (extractedUsername) {
      setUsername(extractedUsername);
      setIsModalOpen(true);
    } else {
      alert("유효한 GitHub URL 형식이 아닙니다. (예: https://github.com/username)");
    }
  };

  const handleSelectMethod = (method: 'pinned' | 'recent') => {
    setIsModalOpen(false);
    router.push(`/mycabo?username=${username}&method=${method}`);
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black py-16">
        <main className="flex w-full max-w-3xl flex-col items-center justify-between px-8 sm:px-16 space-y-16">

          {/* Hero Section */}
          <section className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
              CABO : 까보니 별거 없네
            </h1>
            <p className="text-xl leading-8 text-zinc-700 dark:text-zinc-300 max-w-2xl">
              "이력서는 거짓말을 해도, 코드는 하지 않습니다." <br />
              진짜 개발 실력을 AI가 검증합니다.
            </p>
            <p className="text-lg leading-7 text-zinc-600 dark:text-zinc-400 max-w-xl">
              GitHub URL 하나로 AI가 개발자의 성실성, 코드 품질, 협업 스타일을 분석하여 객관적인 리포트를 제공합니다.
            </p>
            <div className="mt-8 flex w-full max-w-md flex-col gap-4">
              <input
                type="text"
                placeholder="GitHub URL을 입력하세요 (예: https://github.com/username)"
                className="w-full rounded-full border border-zinc-300 bg-white px-5 py-3 text-lg text-zinc-900 placeholder-zinc-500 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    openAnalysisModal();
                  }
                }}
              />
              <button
                onClick={openAnalysisModal}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
              >
                개발자 분석 시작하기
              </button>
            </div>
          </section>

          {/* Other sections remain the same */}
          {/* Problem Section */}
          <section className="flex flex-col items-center gap-6 text-center sm:text-left sm:items-start w-full">
            <h2 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
              🚩 문제: 슈뢰딩거의 팀원
            </h2>
            <p className="text-lg leading-7 text-zinc-600 dark:text-zinc-400 max-w-2xl">
              사이드 프로젝트 팀원 모집 시 불확실성에 시달립니다. 이력서와 달리 코드는 거짓말하지 않지만, 일일이 확인하긴 어렵습니다.
            </p>
            <ul className="list-disc list-inside text-lg leading-7 text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>"저 리액트 좀 해요" (Hello World만 찍어봄)</li>
              <li>"열정 있습니다!" (3일 뒤 연락 두절)</li>
              <li>"소통 원활합니다" (코드 리뷰 달면 싸우자고 덤빔)</li>
            </ul>
          </section>

          {/* Solution Section */}
          <section className="flex flex-col items-center gap-6 text-center sm:text-left sm:items-start w-full">
            <h2 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
              💡 해결책: 데이터 기반 개발자 전투력 측정기
            </h2>
            <p className="text-lg leading-7 text-zinc-600 dark:text-zinc-400 max-w-2xl">
              CABO는 GitHub URL로 AI가 개발자의 성실성, 코드 품질, 협업 스타일을 분석, '객관적인 개발자 리포트'를 제공하여 숨겨진 실체를 보여줍니다.
            </p>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 w-full mt-8">
              {/* Feature cards */}
              <div className="flex flex-col items-start gap-3 p-6 rounded-lg bg-white dark:bg-zinc-800 shadow-md">
                <h3 className="text-xl font-semibold text-black dark:text-zinc-50">1. 📉 잠수함 탐지</h3>
                <p className="text-base text-zinc-600 dark:text-zinc-400">커밋 주기 분석으로 꾸준함과 잠수 여부 판별.</p>
              </div>
              <div className="flex flex-col items-start gap-3 p-6 rounded-lg bg-white dark:bg-zinc-800 shadow-md">
                <h3 className="text-xl font-semibold text-black dark:text-zinc-50">2. 🧹 코드 청결도 분석</h3>
                <p className="text-base text-zinc-600 dark:text-zinc-400">AI가 코드를 분석하여 변수명, 주석, 함수 분리 등을 평가해 유지보수 점수 제공.</p>
              </div>
              <div className="flex flex-col items-start gap-3 p-6 rounded-lg bg-white dark:bg-zinc-800 shadow-md">
                <h3 className="text-xl font-semibold text-black dark:text-zinc-50">3. 🗣️ 협업 매너 분석</h3>
                <p className="text-base text-zinc-600 dark:text-zinc-400">PR/Issue 코멘트 분석으로 피드백 수용 태도 등을 평가해 팀워크 점수 산출.</p>
              </div>
              <div className="flex flex-col items-start gap-3 p-6 rounded-lg bg-white dark:bg-zinc-800 shadow-md">
                <h3 className="text-xl font-semibold text-black dark:text-zinc-50">4. 🪪 개발자 티어 카드</h3>
                <p className="text-base text-zinc-600 dark:text-zinc-400">분석 결과를 종합하여 게임 스탯처럼 프로필 카드 생성.</p>
              </div>
            </div>
          </section>
          
          <footer className="w-full text-center mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-700">
            <p className="text-md text-zinc-500 dark:text-zinc-400">&copy; 2025 CABO. All rights reserved.</p>
          </footer>
        </main>
      </div>
      {isModalOpen && <AnalysisMethodModal onSelect={handleSelectMethod} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}