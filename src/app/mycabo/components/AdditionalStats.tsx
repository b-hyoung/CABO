"use client";

import { DeveloperData } from '@/app/types';

interface Props {
    stats: DeveloperData['stats'];
}

const Punchcard = ({ data }: { data: number[][] }) => {
    if (!data || data.length !== 7) return null;

    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const hours = Array.from({ length: 12 }, (_, i) => i * 2); // 0, 2, 4... 22

    // Aggregate 24-hour data into 12 2-hour bins
    const binnedData = data.map(dayData => {
        const newDayData = Array(12).fill(0);
        if (dayData.length === 24) {
            for (let hour = 0; hour < 24; hour++) {
                const binIndex = Math.floor(hour / 2);
                newDayData[binIndex] += dayData[hour];
            }
        }
        return newDayData;
    });

    const maxCommits = Math.max(...binnedData.flat(), 1);

    return (
        <div className="rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md">
            <h4 className="text-xl font-bold mb-4 text-black dark:text-white">커밋 펀치 카드</h4>
            <div className="grid grid-cols-[auto_repeat(12,1fr)] gap-y-2 gap-x-1 sm:gap-x-1.5 text-xs text-center text-zinc-500 dark:text-zinc-400">
                <div /> 
                {hours.map(hour => <div key={hour} className="text-xs sm:text-sm">{hour}</div>)}
                
                {days.map((day, dayIndex) => (
                    <>
                        <div key={day} className="font-semibold self-center pr-2 text-xs sm:text-sm">{day}</div>
                        {hours.map((_, hourIndex) => {
                            const commitCount = binnedData[dayIndex]?.[hourIndex] ?? 0;
                            const opacity = commitCount > 0 ? (commitCount / maxCommits) * 0.9 + 0.1 : 0.05;
                            return (
                                <div 
                                    key={`${day}-${hourIndex}`}
                                    className="w-full h-4 rounded-sm bg-blue-500"
                                    style={{ opacity }}
                                    title={`${hourIndex * 2}:00 - ${hourIndex * 2 + 1}:59: ${commitCount} commits`}
                                ></div>
                            );
                        })}
                    </>
                ))}
            </div>
        </div>
    );
};

const LongestStreak = ({ streak }: { streak: number }) => {
    return (
        <div className="text-center">
            <h4 className="text-lg font-semibold text-zinc-600 dark:text-zinc-400 mb-1">🏆 최장 연속 커밋</h4>
            <p className="text-4xl font-extrabold text-black dark:text-white">{streak}<span className="text-xl font-medium ml-1">일</span></p>
        </div>
    );
};

const BusiestDay = ({ day }: { day: { date: string, count: number } }) => {
    if (!day || !day.date) return null;
    return (
        <div className="text-center">
            <h4 className="text-lg font-semibold text-zinc-600 dark:text-zinc-400 mb-1">🔥 가장 바빴던 날</h4>
            <p className="text-4xl font-extrabold text-black dark:text-white">{day.count}<span className="text-xl font-medium ml-1">커밋</span></p>
            <p className="text-sm text-zinc-500 dark:text-zinc-300 mt-1">{day.date}</p>
        </div>
    );
};


const AdditionalStats = ({ stats }: Props) => {
    if (!stats.punchcard || !stats.longestStreak || !stats.busiestDay) {
        return null;
    }

    return (
        <section className="w-full space-y-8">
            <Punchcard data={stats.punchcard} />
            <div className="grid md:grid-cols-2 gap-8">
                <div className="rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md flex items-center justify-center">
                    <LongestStreak streak={stats.longestStreak} />
                </div>
                <div className="rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-md flex items-center justify-center">
                    <BusiestDay day={stats.busiestDay} />
                </div>
            </div>
        </section>
    );
};

export default AdditionalStats;