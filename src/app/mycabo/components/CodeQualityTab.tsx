"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { QualityScore, CodeSmell, CodeQualityData } from '@/app/types'; // Import types

interface Props {
    qualityData: CodeQualityData | null;
    isLoading: boolean;
    error: string | null;
}

// --- Helper Components ---
const getRating = (score: number) => {
    if (score >= 90) return { text: '매우 좋음', color: 'text-green-500' };
    if (score >= 70) return { text: '좋음', color: 'text-blue-500' };
    if (score >= 50) return { text: '보통', color: 'text-yellow-500' };
    return { text: '개선 필요', color: 'text-red-500' };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-zinc-800 text-white rounded-md text-sm border border-zinc-700">
        <p className="font-bold">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// --- Main Component ---
const CodeQualityTab = ({ qualityData, isLoading, error }: Props) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-80 rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md">
                <p className="text-lg text-black dark:text-white animate-pulse">코드 품질을 분석하는 중입니다...</p>
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
    
    if (!qualityData) {
        return (
            <div className="flex justify-center items-center h-80 rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md">
                <p className="text-lg text-black dark:text-white">데이터를 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Score Section */}
            <div className="rounded-xl bg-white dark:bg-zinc-800 p-6 sm:p-8 shadow-md">
                <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white mb-4">
                    <span className="text-2xl">📊</span> 코드 품질 상세 지표
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    각 지표는 커밋 습관의 특정 측면을 점수화합니다. 점수가 높을수록 해당 습관이 잘 관리되고 있음을 의미합니다.
                </p>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Column 1: Radar Chart */}
                    <div className="w-full h-72 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={qualityData.scores}>
                                <PolarGrid stroke="var(--border-color, #e5e7eb)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-color-secondary, #6b7280)', fontSize: 14 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8884d8', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Radar name="점수" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Column 2: Legend/List */}
                    <div className="space-y-5">
                        {qualityData.scores.map(item => {
                            const rating = getRating(item.score);
                            let description = '';
                            switch (item.subject) {
                                case '의미도': description = '메시지 명확성 및 의도 전달 수준'; break;
                                case '정보량': description = '메시지 정보의 양 (간접적)'; break;
                                case '구조화': description = '메시지 구조(예: Conventional Commits) 준수율'; break;
                                case '작업분할': description = '커밋당 변경 라인 수의 적정성'; break;
                                case '변경범위': description = '커밋당 변경 파일 수의 적정성'; break;
                                case '리듬': description = '꾸준하고 지속적인 커밋 활동 패턴'; break;
                                default: description = '';
                            }
                            return (
                                <div key={item.subject} className="flex flex-col mb-3 last:mb-0"> {/* Added mb-3 for spacing */}
                                    <div className="flex justify-between items-start"> {/* items-start for better alignment */}
                                        <span className="font-semibold text-zinc-700 dark:text-zinc-300 w-2/3">{item.subject}</span> {/* Give more space for subject */}
                                        <div className="flex items-center">
                                            <span className={`font-bold text-sm ${rating.color}`}>{rating.text}</span>
                                            <span className="font-mono text-lg w-12 text-right text-black dark:text-white">{item.score}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{description}</p> {/* Smaller font, less margin */}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Code Smells Section */}
            <div className="rounded-xl bg-white dark:bg-zinc-800 p-6 sm:p-8 shadow-md">
                <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white mb-6">
                    <span className="text-2xl">🔍</span> 주요 코드 스멜
                </h3>

                {qualityData.codeSmells.length === 0 ? (
                    <p className="text-zinc-600 dark:text-zinc-400 text-center">현재 감지된 코드 스멜이 없습니다. 좋은 위생 습관을 유지하고 계십니다! ✨</p>
                ) : (
                    <div className="space-y-6">
                        {/* Major Code Smells */}
                        {qualityData.codeSmells.filter(s => s.severity === 'Major').length > 0 && (
                            <div>
                                <h4 className="font-bold text-lg text-red-400 mb-4">🔴 주요 (Major)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {qualityData.codeSmells.filter(s => s.severity === 'Major').map((smell, index) => (
                                        <div key={index} className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                                            <h5 className="font-semibold text-black dark:text-white mb-1">{smell.type}</h5>
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300">{smell.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Minor Code Smells */}
                        {qualityData.codeSmells.filter(s => s.severity === 'Minor').length > 0 && (
                            <div>
                                <h4 className="font-bold text-lg text-yellow-400 mb-4">🟡 사소 (Minor)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {qualityData.codeSmells.filter(s => s.severity === 'Minor').map((smell, index) => (
                                        <div key={index} className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                                            <h5 className="font-semibold text-black dark:text-white mb-1">{smell.type}</h5>
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300">{smell.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeQualityTab;
