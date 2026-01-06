import { NextRequest, NextResponse } from 'next/server';

// --- Common Data Structures and Mock Data ---
const mockTier = {
    tier: "Expert",
    tierColor: "text-blue-500",
    tierIcon: "🔵",
    tierDescription: "1인분은 거뜬히 해내는 든든한 팀원",
};
const mockBadges = [
    { name: '까보냥', description: 'CABO 첫 분석 완료!', icon: '🐱' }
];

// --- Activity Analysis (Ghost Detector) ---
async function analyzeUserActivity(username: string, githubPat: string) {
    const headers = { Authorization: `token ${githubPat}`, 'X-GitHub-Api-Version': '2022-11-28' };
    let allEvents: any[] = [];
    try {
        for (let page = 1; page <= 3; page++) {
            const eventsRes = await fetch(`https://api.github.com/users/${username}/events?per_page=100&page=${page}`, { headers, cache: 'no-store' });
            if (!eventsRes.ok) break;
            const events = await eventsRes.json();
            if (events.length === 0) break;
            allEvents = allEvents.concat(events);
        }
    } catch (e) {
        console.error("Failed to fetch GitHub events:", e);
        return { consistency: "분석 실패", commitFrequency: "N/A", mainActivityDay: "N/A", mainActivityTime: "N/A" };
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const pushEvents = allEvents.filter(event => event.type === 'PushEvent' && new Date(event.created_at) > ninetyDaysAgo);
    const totalCommitsInPeriod = pushEvents.reduce((sum, e) => e.payload.commits ? sum + e.payload.commits.length : e.payload.size ? sum + e.payload.size : sum + 1, 0);

    if (totalCommitsInPeriod < 20) { // Increase threshold for more meaningful analysis
        return {
            consistency: "공개 활동 정보 부족",
            commitFrequency: "최근 90일간 공개 커밋 20회 미만",
            mainActivityDay: "N/A",
            mainActivityTime: "N/A",
        };
    }
    
    const commitsByWeek = Array(13).fill(0);
    const commitsByDay = Array(7).fill(0);
    const commitsByHour: number[] = Array(24).fill(0);
    const commitHours: number[] = [];
    const punchcardData = Array(7).fill(0).map(() => Array(24).fill(0));
    const commitDates = new Set<string>();
    const dailyCommitCounts: { [date: string]: number } = {};

    const now = new Date();
    pushEvents.forEach(event => {
        const eventDate = new Date(event.created_at);
        let commitsCount = event.payload.commits ? event.payload.commits.length : event.payload.size ? event.payload.size : 1;
        
        const weekIndex = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        if (weekIndex < 13) commitsByWeek[weekIndex] += commitsCount;
        
        const kstTime = new Date(eventDate.getTime() + (9 * 60 * 60 * 1000));
        const kstHour = kstTime.getUTCHours();
        const kstDay = kstTime.getUTCDay();

        punchcardData[kstDay][kstHour] += commitsCount;
        const dateString = kstTime.toISOString().split('T')[0];
        commitDates.add(dateString);
        dailyCommitCounts[dateString] = (dailyCommitCounts[dateString] || 0) + commitsCount;

        commitsByDay[kstDay] += commitsCount;
        commitsByHour[kstHour] += commitsCount;
        for (let i = 0; i < commitsCount; i++) commitHours.push(kstHour);
    });

    const sortedDates = Array.from(commitDates).sort();
    let longestStreak = 0;
    let currentStreak = 0;
    if (sortedDates.length > 0) {
        currentStreak = 1;
        longestStreak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const previousDate = new Date(sortedDates[i - 1]);
            const diffTime = currentDate.getTime() - previousDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }
        }
    }

    let busiestDay = { date: '', count: 0 };
    for (const [date, count] of Object.entries(dailyCommitCounts)) {
        if (count > busiestDay.count) {
            busiestDay = { date, count };
        }
    }

    const activeWeeksResult = commitsByWeek.filter(count => count > 0);
    const mean = activeWeeksResult.reduce((a, b) => a + b, 0) / (activeWeeksResult.length || 1);
    const stdDev = Math.sqrt(activeWeeksResult.map(c => Math.pow(c - mean, 2)).reduce((a, b) => a + b, 0) / (activeWeeksResult.length || 1));
    const hourMean = commitHours.reduce((a, b) => a + b, 0) / (commitHours.length || 1);
    const hourStdDev = Math.sqrt(commitHours.map(h => Math.pow(h - hourMean, 2)).reduce((a, b) => a + b, 0) / (commitHours.length || 1));

    let persona = "";
    if (hourStdDev < 3 && totalCommitsInPeriod > 50) {
        persona = "인간 스케줄러 🤖";
    } else if (stdDev > mean * 1.2 && stdDev > 4) {
        persona = "벼락치기 빌런 ⚡️";
    }
    if (!persona) {
        const weekendCommits = commitsByDay[0] + commitsByDay[6];
        const weekendRatio = weekendCommits / totalCommitsInPeriod;
        let dayPart = "꾸준한";
        if (weekendRatio > 0.65) {
            dayPart = "주말";
        } else if (weekendRatio < 0.35) {
            dayPart = "평일";
        }
        const nightCommits = commitsByHour.slice(0, 6).reduce((a, b) => a + b, 0);
        const morningCommits = commitsByHour.slice(8, 12).reduce((a, b) => a + b, 0);
        const afternoonCommits = commitsByHour.slice(12, 18).reduce((a, b) => a + b, 0);
        const eveningCommits = commitsByHour.slice(18, 24).reduce((a, b) => a + b, 0);
        const timeCategories = {
            '새벽의 올빼미 🦉': nightCommits,
            '오전형 개발자 ☀️': morningCommits,
            '오후의 해결사 ☕️': afternoonCommits,
            '저녁형 개발자 🌙': eveningCommits,
        };
        let timePart = Object.keys(timeCategories).reduce((a, b) => timeCategories[a] > timeCategories[b] ? a : b);
        persona = `${dayPart} ${timePart}`;
    }

    const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const mainActivityDay = `${dayNames[commitsByDay.indexOf(Math.max(...commitsByDay))]}`;
    const mainActivityTime = `${commitsByHour.indexOf(Math.max(...commitsByHour))}시`;
    const commitFrequency = `주 평균 ${Math.round(totalCommitsInPeriod / 13)}회`;

    const finalResult = { 
        consistency: persona, 
        commitFrequency, 
        mainActivityDay, 
        mainActivityTime,
        punchcard: punchcardData,
        longestStreak: longestStreak,
        busiestDay: busiestDay,
    };
    console.log("--- Final Activity Analysis Result (Recent Activity) ---", finalResult);
    return finalResult;
}


// --- Main GET Handler ---
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const username = url.pathname.split('/').pop()!;
    const method = url.searchParams.get('method') || 'pinned';
    const githubPat = process.env.GITHUB_PAT;
    if (!githubPat) return NextResponse.json({ error: 'GitHub PAT가 서버에 설정되지 않았습니다.' }, { status: 500 });

    try {
        const headers = { Authorization: `token ${githubPat}`, 'X-GitHub-Api-Version': '2022-11-28' };

        // Fetch userData
        const userRes = await fetch(`https://api.github.com/users/${username}`, { headers, cache: 'no-store' });
        if (!userRes.ok) {
            if (userRes.status === 404) throw new Error('GitHub 사용자 이름이 존재하지 않습니다.');
            throw new Error(`GitHub API 오류: ${userRes.statusText}`);
        }
        const userData = await userRes.json();

        // Fetch languageStats from repositories (pinned or recent based on method)
        let reposData: any[] = [];
        if (method === 'recent') {
            const reposRes = await fetch(`https://api.github.com/users/${username}/repos?type=owner&sort=pushed&per_page=100`, { headers, cache: 'no-store' });
            if (!reposRes.ok) throw new Error(`리포지토리 조회 API 오류: ${reposRes.statusText}`);
            reposData = await reposRes.json(); // Added await
        } else { // default to 'pinned'
            const graphqlQuery = { query: `query GetPinnedReposAndUserInfo($username: String!) { user(login: $username) { pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository { name languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } } } } } }`, variables: { username } };
            const graphqlRes = await fetch('https://api.github.com/graphql', { method: 'POST', headers: { Authorization: `bearer ${githubPat}`, 'Content-Type': 'application/json' }, body: JSON.stringify(graphqlQuery), cache: 'no-store' });
            if (!graphqlRes.ok) { const d = await graphqlRes.json(); throw new Error(`GitHub GraphQL API 오류: ${d.message||graphqlRes.statusText}`); }            const { data: graphqlData } = await graphqlRes.json();
            reposData = graphqlData.user.pinnedItems.nodes;
        }

        const languageStats: { [k: string]: { bytes: number, color: string | null } } = {};
        // Ensure reposData is an array before filtering and mapping
        const topRepos = Array.isArray(reposData) ? reposData.filter((repo: any) => {
            // For REST API repos (recent)
            if (repo.language) return !repo.fork;
            // For GraphQL API repos (pinned)
            if (repo.languages && repo.languages.edges && repo.languages.edges.length > 0) return true;
            return false;
        }).slice(0, 15) : [];

        await Promise.all(topRepos.map(async (repo: any) => {
            // For pinned repos (GraphQL), languages are directly available in the initial query.
            // For recent repos (REST), need to fetch language_url.
            if (repo.languages && repo.languages.edges) { // GraphQL structure (pinned)
                repo.languages.edges.forEach((edge: any) => {
                    if (!edge.node) return;
                    languageStats[edge.node.name] = { bytes: (languageStats[edge.node.name]?.bytes || 0) + edge.size, color: edge.node.color };
                });
            } else if (repo.languages_url) { // REST structure (recent)
                const langRes = await fetch(repo.languages_url, { headers, cache: 'no-store' });
                if (langRes.ok) {
                    const langData = await langRes.json();
                    for (const [lang, bytes] of Object.entries(langData)) {
                        languageStats[lang] = { bytes: (languageStats[lang]?.bytes || 0) + (bytes as number), color: null };
                    }
                }
            }
        }));


        const totalBytes = Object.values(languageStats).reduce((sum, lang) => sum + lang.bytes, 0);
        const topLanguages = Object.entries(languageStats).sort(([, a], [, b]) => b.bytes - a.bytes).slice(0, 3).map(([name, { bytes, color }]) => ({ name, percentage: totalBytes > 0 ? parseFloat(((bytes / totalBytes) * 100).toFixed(1)) : 0, color: color || `hsl(${Math.random() * 360}, 70%, 50%)` }));

        const activityStats = await analyzeUserActivity(username, githubPat); // Use global events for recent or pinned
        
        return NextResponse.json({
            name: userData.name || userData.login,
            githubHandle: userData.login,
            avatarUrl: userData.avatarUrl || userData.avatar_url,
            ...mockTier,
            stats: {
                ...activityStats,
            },
            languages: topLanguages,
            badges: mockBadges,
        });

    } catch (error: any) {
        console.error('Error fetching GitHub data:', error.message);
        return NextResponse.json({ error: error.message || '알 수 없는 서버 오류가 발생했습니다.' }, { status: 500 });
    }
}