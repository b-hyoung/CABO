import { DeveloperData } from '@/app/types';

interface Props {
    developer: DeveloperData;
}

const CollaborationStyleTab = ({ developer }: Props) => {
    return (
        <div className="flex flex-col gap-4 rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md">
            <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white"><span className="text-2xl">🗣️</span> 협업 매너</h3>
            <p className="text-zinc-600 dark:text-zinc-400">PR, Issue의 코멘트를 분석하여 협업 스타일을 진단합니다.</p>
            <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
                <div className="text-center rounded-lg bg-zinc-100 dark:bg-zinc-700 p-3"><p className="text-sm text-zinc-500 dark:text-zinc-400">팀워크 점수</p><p className="text-lg font-bold text-black dark:text-white">{developer.stats.communicationScore} / 100</p></div>
                <div className="text-center rounded-lg bg-zinc-100 dark:bg-zinc-700 p-3"><p className="text-sm text-zinc-500 dark:text-zinc-400">소통 스타일</p><p className="text-lg font-bold text-black dark:text-white">{developer.stats.teamworkStyle}</p></div>
            </div>
        </div>
    );
};

export default CollaborationStyleTab;
