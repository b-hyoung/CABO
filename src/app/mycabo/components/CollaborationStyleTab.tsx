"use client";

import { CollaborationData, CollaborationRepoAnalysis, CollaborationMetrics } from '@/app/types';

interface Props {
    collaborationData: CollaborationData | null;
    isLoading: boolean;
    error: string | null;
}

// Helper to format hours into Korean time
const formatHoursToKoreanTime = (hours: number | 'N/A'): string => {
    if (hours === 'N/A') {
        return 'N/A';
    }
    const totalMinutes = Math.round(hours * 60);

    if (totalMinutes === 0 && hours > 0) { // For very small non-zero values like 0.08 hours
        return '< 1분';
    } else if (totalMinutes === 0) { // For exactly zero hours
        return '0분';
    }

    const totalHours = Math.floor(totalMinutes / 60);
    const displayDays = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    const remainingMinutes = totalMinutes % 60;

    let result = '';
    if (displayDays > 0) {
        result += `${displayDays}일 `;
    }
    if (remainingHours > 0) {
        result += `${remainingHours}시간 `;
    }
    if (remainingMinutes > 0) {
        result += `${remainingMinutes}분`;
    }

    return result.trim(); // Trim to remove trailing space if only one unit
};

// --- New Helper Function for PR Style Analysis ---
const getPrStyleProfile = (metrics: CollaborationMetrics) => {
    const { prOpenedCount, prMergedCount, prSizeLinesMedian, prLeadTimeMedianHours } = metrics;

    // Default profile
    const profile = {
        persona: "정보 부족",
        summary: "PR 분석에 필요한 데이터가 충분하지 않습니다.",
        sizeRating: { text: 'N/A', color: 'text-zinc-500' },
        speedRating: { text: 'N/A', color: 'text-zinc-500' },
        mergeRate: { rate: 'N/A' as string | number, color: 'text-zinc-500' },
    };

    if (prOpenedCount === 'N/A' || prOpenedCount < 5) return profile;

    // 1. Merge Rate
    const mergeRateValue = prMergedCount !== 'N/A' && prOpenedCount > 0 
        ? Math.round((prMergedCount / prOpenedCount) * 100) 
        : 'N/A';
    
    if (mergeRateValue !== 'N/A') {
        profile.mergeRate.rate = `${mergeRateValue}%`;
        if (mergeRateValue >= 90) profile.mergeRate.color = 'text-green-500';
        else if (mergeRateValue >= 70) profile.mergeRate.color = 'text-blue-500';
        else profile.mergeRate.color = 'text-yellow-500';
    }

    // 2. PR Size
    if (prSizeLinesMedian !== 'N/A') {
        if (prSizeLinesMedian <= 100) {
            profile.sizeRating = { text: '간결함', color: 'text-green-500' };
        } else if (prSizeLinesMedian <= 400) {
            profile.sizeRating = { text: '표준', color: 'text-blue-500' };
        } else {
            profile.sizeRating = { text: '대규모', color: 'text-yellow-500' };
        }
    }

    // 3. PR Speed (Lead Time)
    if (prLeadTimeMedianHours !== 'N/A') {
        if (prLeadTimeMedianHours <= 8) {
            profile.speedRating = { text: '신속함', color: 'text-green-500' };
        } else if (prLeadTimeMedianHours <= 24) {
            profile.speedRating = { text: '표준', color: 'text-blue-500' };
        } else if (prLeadTimeMedianHours <= 72) {
            profile.speedRating = { text: '여유로움', color: 'text-yellow-500' };
        } else {
            profile.speedRating = { text: '지연됨', color: 'text-red-500' };
        }
    }

    // 4. Determine Persona
    if (profile.sizeRating.text === '간결함' && profile.speedRating.text === '신속함' && mergeRateValue !== 'N/A' && mergeRateValue >= 70) {
        profile.persona = '애자일 기여자';
        profile.summary = '신속하고 작은 단위로 꾸준히 기여하는 스타일입니다.';
    } else if (profile.sizeRating.text === '대규모') {
        profile.persona = '피쳐 개발자';
        profile.summary = '한 번에 크고 중요한 피쳐를 중심으로 작업하는 스타일입니다.';
    } else if (profile.speedRating.text === '신속함') {
        profile.persona = '빠른 해결사';
        profile.summary = '빠른 속도로 PR을 처리하는 데 강점이 있습니다.';
    } else {
        profile.persona = '꾸준한 기여자';
        profile.summary = '자신만의 속도로 꾸준히 프로젝트에 기여합니다.';
    }

    return profile;
};


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
                <p className="text-lg text-black dark:text-white">데이터를 찾을 수 없습니다. 핀 고정된 레포지토리가 없거나, 지난 90일간 팀 활동이 없습니다.</p>
            </div>
        );
    }

    // Helper to render metric value (N/A if it's 'N/A')
    const renderMetric = (value: number | string | 'N/A') => {
        return value === 'N/A' ? <span className="text-zinc-500">N/A</span> : value;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {collaborationData.repoAnalyses.map((repoAnalysis: CollaborationRepoAnalysis) => {
                const prProfile = getPrStyleProfile(repoAnalysis.metrics);

                return (
                    <div key={repoAnalysis.repoName} className="rounded-xl bg-white dark:bg-zinc-800 p-6 sm:p-8 shadow-md">
                        <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white mb-4">
                            <span className="text-2xl">🤝</span> {repoAnalysis.repoName} - <span className={repoAnalysis.classification === 'Team' ? 'text-green-500' : 'text-blue-500'}>{repoAnalysis.classification === 'Team' ? '팀 프로젝트' : '개인 프로젝트'}</span>
                        </h3>
                        {repoAnalysis.classification === 'Solo' ? (
                            <p className="text-zinc-600 dark:text-zinc-400 text-base">
                                개인 프로젝트로 분류되어 협업 지표가 제공되지 않습니다.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                {/* PR 작성 스타일 */}
                                <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-700/30 p-5 rounded-lg shadow-sm">
                                    <h4 className="font-semibold text-black dark:text-white mb-3">PR 작성 스타일</h4>
                                    <div className="text-center bg-white dark:bg-zinc-800 p-4 rounded-md shadow-inner">
                                        <h5 className="text-lg font-bold text-blue-600 dark:text-blue-400">✨ {prProfile.persona}</h5>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{prProfile.summary}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                                        <div>
                                            <p className="text-xs text-zinc-500">PR 병합률</p>
                                            <p className={`text-lg font-bold ${prProfile.mergeRate.color}`}>{prProfile.mergeRate.rate}</p>
                                            <p className="text-xs text-zinc-500">
                                                ({renderMetric(repoAnalysis.metrics.prMergedCount)}/{renderMetric(repoAnalysis.metrics.prOpenedCount)})
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500">PR 규모</p>
                                            <p className={`text-lg font-bold ${prProfile.sizeRating.color}`}>{prProfile.sizeRating.text}</p>
                                            <p className="text-xs text-zinc-500">({renderMetric(repoAnalysis.metrics.prSizeLinesMedian)} 라인)</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500">PR 속도</p>
                                            <p className={`text-lg font-bold ${prProfile.speedRating.color}`}>{prProfile.speedRating.text}</p>
                                             <p className="text-xs text-zinc-500">({formatHoursToKoreanTime(repoAnalysis.metrics.prLeadTimeMedianHours)})</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 리뷰/이슈 기여도 */}
                                <div className="bg-zinc-50 dark:bg-zinc-700/30 p-5 rounded-lg shadow-sm">
                                    <h4 className="font-semibold text-black dark:text-white mb-3">리뷰 및 이슈</h4>
                                    <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                                        <li className="flex justify-between"><span>리뷰 참여 PR:</span> <strong>{renderMetric(repoAnalysis.metrics.reviewedPrCount)} 건</strong></li>
                                        <li className="flex justify-between"><span>리뷰 코멘트:</span> <strong>{renderMetric(repoAnalysis.metrics.reviewCommentCount)} 개</strong></li>
                                        <li className="flex justify-between"><span>생성 이슈:</span> <strong>{renderMetric(repoAnalysis.metrics.issuesOpenedCount)} 건</strong></li>
                                        <li className="flex justify-between"><span>종료 이슈:</span> <strong>{renderMetric(repoAnalysis.metrics.issuesClosedCount)} 건</strong></li>
                                    </ul>
                                     {repoAnalysis.metrics.coAuthoredByDetected && (
                                        <p className="font-semibold text-green-500 text-center mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-600">✨ Co-authored-by 흔적 발견</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default CollaborationStyleTab;
