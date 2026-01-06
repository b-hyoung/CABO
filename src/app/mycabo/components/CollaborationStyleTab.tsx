"use client";

import { CollaborationData, CollaborationRepoAnalysis } from '@/app/types';

interface Props {
    collaborationData: CollaborationData | null;
    isLoading: boolean;
    error: string | null;
}

const CollaborationStyleTab = ({ collaborationData, isLoading, error }: Props) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-80 rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md">
                <p className="text-lg text-black dark:text-white animate-pulse">협업 스타일을 분석하는 중입니다...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-80 rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md">
                <p className="text-lg text-red-500">{error}</p>
            </div>
        );
    }
    
    if (!collaborationData || collaborationData.repoAnalyses.length === 0) {
        return (
            <div className="flex justify-center items-center h-80 rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md">
                <p className="text-lg text-black dark:text-white">데이터를 찾을 수 없습니다. 핀 고정된 레포지토리가 없거나, 지난 90일간 활동이 없습니다.</p>
            </div>
        );
    }

    // Helper to render metric value (N/A if it's 'N/A')
    const renderMetric = (value: number | string | 'N/A') => {
        return value === 'N/A' ? <span className="text-zinc-500">N/A</span> : value;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {collaborationData.repoAnalyses.map((repoAnalysis: CollaborationRepoAnalysis) => (
                <div key={repoAnalysis.repoName} className="rounded-xl bg-white dark:bg-zinc-800 p-6 sm:p-8 shadow-md">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white mb-4">
                        <span className="text-2xl">🤝</span> {repoAnalysis.repoName} - <span className={repoAnalysis.classification === 'Team' ? 'text-green-500' : 'text-blue-500'}>{repoAnalysis.classification === 'Team' ? '팀 프로젝트' : '개인 프로젝트'}</span>
                    </h3>
                    {repoAnalysis.classification === 'Solo' ? (
                        <p className="text-zinc-600 dark:text-zinc-400 text-base">
                            개인 프로젝트로 분류되어 협업 지표가 제공되지 않습니다.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {/* PR 작성 스타일 */}
                            <div className="bg-zinc-50 dark:bg-zinc-700/30 p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-black dark:text-white mb-2">PR 작성 스타일</h4>
                                <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                    <li>생성 PR 수: {renderMetric(repoAnalysis.metrics.prOpenedCount)} 건</li>
                                    <li>병합 PR 수: {renderMetric(repoAnalysis.metrics.prMergedCount)} 건</li>
                                    <li>PR 크기 (라인 중앙값): {renderMetric(repoAnalysis.metrics.prSizeLinesMedian)} 라인</li>
                                    <li>PR 크기 (파일 중앙값): {renderMetric(repoAnalysis.metrics.prSizeFilesMedian)} 파일</li>
                                    <li>PR 리드타임 (중앙값): {renderMetric(repoAnalysis.metrics.prLeadTimeMedianHours)} 시간</li>
                                </ul>
                            </div>

                            {/* 리뷰 기여도 */}
                            <div className="bg-zinc-50 dark:bg-zinc-700/30 p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold text-black dark:text-white mb-2">리뷰 기여도</h4>
                                <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                    <li>리뷰 참여 PR 수: {renderMetric(repoAnalysis.metrics.reviewedPrCount)} 건</li>
                                    <li>리뷰 코멘트 수: {renderMetric(repoAnalysis.metrics.reviewCommentCount)} 개</li>
                                </ul>
                            </div>

                            {/* 이슈 참여도 (Optional) */}
                            {repoAnalysis.metrics.issuesOpenedCount !== undefined && (
                                <div className="bg-zinc-50 dark:bg-zinc-700/30 p-4 rounded-lg shadow-sm">
                                    <h4 className="font-semibold text-black dark:text-white mb-2">이슈 참여도</h4>
                                    <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                        <li>생성 이슈 수: {renderMetric(repoAnalysis.metrics.issuesOpenedCount)} 건</li>
                                        <li>종료 이슈 수: {renderMetric(repoAnalysis.metrics.issuesClosedCount)} 건</li>
                                        <li>이슈 코멘트 수: {renderMetric(repoAnalysis.metrics.issueCommentCount)} 개</li>
                                    </ul>
                                </div>
                            )}

                            {/* 보조 배지 */}
                            {repoAnalysis.metrics.coAuthoredByDetected && (
                                <div className="bg-zinc-50 dark:bg-zinc-700/30 p-4 rounded-lg shadow-sm flex items-center justify-center">
                                    <p className="font-semibold text-green-500">✨ Co-authored-by 흔적 발견</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CollaborationStyleTab;