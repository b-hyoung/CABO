import Image from "next/image";
import Link from "next/link"; // Link 컴포넌트 추가

export default function Home() {
  return (
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
            />
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-lg font-semibold text-white transition-colors hover:bg-blue-700">
              개발자 분석 시작하기
            </button>
          </div>
        </section>

        {/* Problem Section */}
        <section className="flex flex-col items-center gap-6 text-center sm:text-left sm:items-start w-full">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
            🚩 문제: 슈뢰딩거의 팀원
          </h2>
          <p className="text-lg leading-7 text-zinc-600 dark:text-zinc-400 max-w-2xl">
            사이드 프로젝트나 스터디 팀원 모집 시, 우리는 검증되지 않은 정보로 인한 불확실성에 시달립니다.
          </p>
          <ul className="list-disc list-inside text-lg leading-7 text-zinc-600 dark:text-zinc-400 space-y-2">
            <li>"저 리액트 좀 해요" (Hello World만 찍어봄)</li>
            <li>"열정 있습니다!" (3일 뒤 연락 두절)</li>
            <li>"소통 원활합니다" (코드 리뷰 달면 싸우자고 덤빔)</li>
          </ul>
          <p className="text-lg leading-7 text-zinc-600 dark:text-zinc-400 max-w-2xl">
            자소서는 소설이 될 수 있지만, 커밋 로그와 코드는 진실을 말합니다. 하지만 이를 일일이 확인하기는 어렵습니다.
          </p>
        </section>

        {/* Solution Section */}
        <section className="flex flex-col items-center gap-6 text-center sm:text-left sm:items-start w-full">
          <h2 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-4xl">
            💡 해결책: 데이터 기반 개발자 전투력 측정기
          </h2>
          <p className="text-lg leading-7 text-zinc-600 dark:text-zinc-400 max-w-2xl">
            CABO는 GitHub URL만으로 AI가 개발자의 성실성, 코드 품질, 협업 스타일을 분석해 '객관적인 개발자 리포트'를 제공합니다.
            '까보지 않고는 모르는' 개발자의 실제를 투명하게 보여줍니다.
          </p>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 w-full mt-8">
            <div className="flex flex-col items-start gap-3 p-6 rounded-lg bg-white dark:bg-zinc-800 shadow-md">
              <h3 className="text-xl font-semibold text-black dark:text-zinc-50">1. 📉 잠수함 탐지 (Ghost Detector)</h3>
              <p className="text-base text-zinc-600 dark:text-zinc-400">
                커밋 주기 분석으로 꾸준함과 잠수 여부 판별.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 p-6 rounded-lg bg-white dark:bg-zinc-800 shadow-md">
              <h3 className="text-xl font-semibold text-black dark:text-zinc-50">2. 🧹 코드 청결도 분석 (Code Quality Check)</h3>
              <p className="text-base text-zinc-600 dark:text-zinc-400">
                AI가 코드를 분석하여 변수명, 주석, 함수 분리 등을 평가해 유지보수 점수 제공.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 p-6 rounded-lg bg-white dark:bg-zinc-800 shadow-md">
              <h3 className="text-xl font-semibold text-black dark:text-zinc-50">3. 🗣️ 협업 매너 분석 (Communication Style)</h3>
              <p className="text-base text-zinc-600 dark:text-zinc-400">
                PR/Issue 코멘트 분석으로 피드백 수용 태도 등을 평가해 팀워크 점수 산출.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 p-6 rounded-lg bg-white dark:bg-zinc-800 shadow-md">
              <h3 className="text-xl font-semibold text-black dark:text-zinc-50">4. 🪪 개발자 티어 카드 (Dev Tier Card)</h3>
              <p className="text-base text-zinc-600 dark:text-zinc-400">
                분석 결과를 종합하여 게임 스탯처럼 프로필 카드 생성.
              </p>
            </div>
          </div>
        </section>

        {/* Footer / Call to action - Can be expanded later */}
        <section className="w-full text-center mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-700">
          <p className="text-md text-zinc-500 dark:text-zinc-400">
            &copy; 2025 CABO. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  );
}
