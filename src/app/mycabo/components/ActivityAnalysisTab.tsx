import { DeveloperData, personaTypes } from '@/app/types';

interface Props {
    developer: DeveloperData;
    isTooltipVisible: boolean;
    setIsTooltipVisible: (isVisible: boolean) => void;
    method: 'pinned' | 'recent'; // Added for UI differentiation
}

const ActivityAnalysisTab = ({ developer, isTooltipVisible, setIsTooltipVisible, method }: Props) => {
    return (
        <div className="relative flex flex-col gap-4 rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md">
            <div
                className="absolute top-4 right-4"
                onMouseEnter={() => setIsTooltipVisible(true)}
                onMouseLeave={() => setIsTooltipVisible(false)}
            >
                <span className="cursor-pointer rounded-full bg-zinc-200 px-2 py-0.5 text-sm font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">i</span>
                {isTooltipVisible && (
                    <div className="absolute top-full right-0 z-10 mt-2 w-64 rounded-lg bg-zinc-900 p-3 text-sm text-white shadow-lg text-left">
                        <h4 className="font-bold mb-2">활동 유형 설명</h4>
                        <ul className="space-y-1">
                            {Object.entries(personaTypes).map(([type, desc]) => (
                                <li key={type}><strong className="font-semibold">{type}</strong>: {desc}</li>
                            ))}
                        </ul>
                        <div className="absolute bottom-full right-4 -mb-2 w-4 h-4 transform rotate-45 bg-zinc-900"></div>
                    </div>
                )}
            </div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white">
                <span className="text-2xl">📉</span> 잠수함 탐지
            </h3>
            {method === 'pinned' && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 -mt-2 mb-2">
                    (핀 고정된 리포지토리의 최근 200개 커밋 기준)
                </p>
            )}
            <p className="text-sm text-zinc-600 dark:text-zinc-400">커밋 주기와 시간대를 분석하여 성실성을 파악합니다.</p>
            <div className="mt-auto text-center pt-4">
                <p className="text-3xl font-extrabold text-blue-500">{developer.stats.consistency}</p>
            </div>
            <div className="mt-4 space-y-2 text-center">
                <div className="rounded-lg bg-zinc-100 dark:bg-zinc-700 p-2"><p className="text-xs text-zinc-500 dark:text-zinc-400">커밋 빈도</p><p className="text-sm font-bold text-black dark:text-white">{developer.stats.commitFrequency}</p></div>
                <div className="rounded-lg bg-zinc-100 dark:bg-zinc-700 p-2"><p className="text-xs text-zinc-500 dark:text-zinc-400">주요 활동 요일</p><p className="text-sm font-bold text-black dark:text-white">{developer.stats.mainActivityDay}</p></div>
                <div className="rounded-lg bg-zinc-100 dark:bg-zinc-700 p-2"><p className="text-xs text-zinc-500 dark:text-zinc-400">주요 활동 시간</p><p className="text-sm font-bold text-black dark:text-white">{developer.stats.mainActivityTime}</p></div>
            </div>
        </div>
    );
};

export default ActivityAnalysisTab;
