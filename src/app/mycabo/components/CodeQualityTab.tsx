import { DeveloperData } from '@/app/types';

interface Props {
    developer: DeveloperData;
}

const CodeQualityTab = ({ developer }: Props) => {
    return (
        <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md">
            <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white"><span className="text-2xl">🧹</span> 코드 청결도</h3>
            <p className="text-zinc-600 dark:text-zinc-400">AI가 코드 품질을 분석하여 유지보수성을 측정합니다.</p>
            <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
                <div className="text-center rounded-lg bg-zinc-100 dark:bg-zinc-700 p-3"><p className="text-sm text-zinc-500 dark:text-zinc-400">품질 점수</p><p className="text-lg font-bold text-black dark:text-white">{developer.stats.codeQualityScore} / 100</p></div>
                <div className="text-center rounded-lg bg-zinc-100 dark:bg-zinc-700 p-3"><p className="text-sm text-zinc-500 dark:text-zinc-400">유지보수성</p><p className="text-lg font-bold text-black dark:text-white">{developer.stats.maintainability}</p></div>
            </div>
        </div>
    );
};

export default CodeQualityTab;
