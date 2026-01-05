"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';
import { QualityScore, CodeSmell, CodeQualityData } from '@/app/types'; // Import types

interface Props {
    username: string;
    method: string;
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
const CodeQualityTab = ({ username, method }: Props) => {
    const [qualityData, setQualityData] = useState<CodeQualityData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!username) return;

        const fetchQualityData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch data from the new, separate API endpoint
                const res = await fetch(`/api/github/user/${username}/code_quality?method=${method || 'recent'}`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "코드 품질 데이터를 불러오는 데 실패했습니다.");
                }
                const data: CodeQualityData = await res.json();
                setQualityData(data);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQualityData();
    }, [username, method]); // Re-fetch when username or method changes

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

    const getOverallRatingColor = (rating: CodeQualityData['overallRating']) => {
        switch (rating) {
            case 'Clean': return 'text-green-500';
            case 'Mixed': return 'text-yellow-500';
            case 'Messy': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Overall Rating Section */}
            <div className="rounded-xl bg-white dark:bg-zinc-800 p-6 sm:p-8 shadow-md flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white">
                    <span className="text-2xl">🏆</span> 종합 위생 등급
                </h3>
                <p className={`text-3xl font-extrabold ${getOverallRatingColor(qualityData.overallRating)}`}>
                    {qualityData.overallRating}
                </p>
            </div>

            {/* Score Section */}
            <div className="rounded-xl bg-white dark:bg-zinc-800 p-6 sm:p-8 shadow-md">
                <h3 className="flex items-center gap-2 text-xl font-bold text-black dark:text-white mb-6">
                    <span className="text-2xl">📊</span> 코드 품질 상세 지표
                </h3>
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
                            return (
                                <div key={item.subject} className="flex justify-between items-center">
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.subject}</span>
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <span className={`font-bold text-sm ${rating.color}`}>{rating.text}</span>
                                        <span className="font-mono text-lg w-12 text-right text-black dark:text-white">{item.score}</span>
                                    </div>
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
                <ul className="space-y-5">
                    {qualityData.codeSmells.map((smell, index) => (
                        <li key={index} className="flex items-start gap-4">
                            <span className={`mt-1 text-lg ${smell.severity === 'Major' ? 'text-red-400' : 'text-yellow-400'}`}>
                                {smell.severity === 'Major' ? '🔴' : '🟡'}
                            </span>
                            <div>
                                <h4 className="font-semibold text-black dark:text-white">{smell.type}</h4>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">{smell.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CodeQualityTab;
