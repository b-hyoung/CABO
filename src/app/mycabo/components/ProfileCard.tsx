import Image from 'next/image';
import { DeveloperData } from '@/app/types';

interface Props {
    developer: DeveloperData;
}

const ProfileCard = ({ developer }: Props) => {
    return (
        <section className="w-full rounded-2xl bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative flex-shrink-0">
                        <Image src={developer.avatarUrl} alt="Developer Avatar" width={128} height={128} className="rounded-full border-4 border-white dark:border-zinc-700 shadow-md" />
                        <span className="absolute bottom-1 right-1 text-4xl">{developer.tierIcon}</span>
                    </div>
                    <div className="flex flex-col items-center sm:items-start gap-2">
                        <h2 className="text-4xl font-extrabold text-black dark:text-white">{developer.name}</h2>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400">@{developer.githubHandle}</p>
                        <div className={`mt-4 rounded-full px-4 py-1.5 text-lg font-bold ${developer.tierColor} bg-blue-100 dark:bg-blue-900/50`}>
                            {developer.tier} Tier
                        </div>
                        <p className="mt-2 text-center sm:text-left text-zinc-600 dark:text-zinc-300">{developer.tierDescription}</p>
                    </div>
                </div>
                <div className="md:col-span-1 flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-black dark:text-white text-center md:text-left">주요 사용 언어</h3>
                    <div className="space-y-3">
                        {developer.languages && developer.languages.map(lang => (
                            <div key={lang.name}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-base font-medium text-zinc-700 dark:text-zinc-300">{lang.name}</span>
                                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{lang.percentage}%</span>
                                </div>
                                <div className="w-full bg-zinc-200 rounded-full h-2.5 dark:bg-zinc-700">
                                    <div className="h-2.5 rounded-full" style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProfileCard;
