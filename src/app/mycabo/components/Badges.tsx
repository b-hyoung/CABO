import { DeveloperData } from '@/app/types';

interface Props {
    developer: DeveloperData;
}

const Badges = ({ developer }: Props) => {
    return (
        <section className="w-full">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-4">획득 뱃지</h3>
            <div className="flex flex-wrap gap-4">
                {developer.badges && developer.badges.map(badge => (
                    <div key={badge.name} className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-white dark:bg-zinc-800 shadow-md w-36">
                        <span className="text-5xl p-2 bg-zinc-100 dark:bg-zinc-700 rounded-full">{badge.icon}</span>
                        <p className="font-bold text-black dark:text-white">{badge.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{badge.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Badges;
