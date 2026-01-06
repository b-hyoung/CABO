import { NextRequest, NextResponse } from 'next/server';
import { CodeQualityData, DetailedMetrics, QualityScore, CodeSmell } from '@/app/types';



// Helper to fetch detailed commit information
async function fetchCommitDetails(owner: string, repo: string, sha: string, githubPat: string) {
    const headers = { Authorization: `token ${githubPat}`, 'X-GitHub-Api-Version': '2022-11-28' };
    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, { headers, cache: 'no-store' });
        if (!res.ok) {
            console.error(`Failed to fetch commit details for ${owner}/${repo}/${sha}: ${res.statusText}`);
            return null;
        }
        const data = await res.json();
        return {
            additions: data.stats.additions,
            deletions: data.stats.deletions,
            filesChanged: data.files.length,
        };
    } catch (e) {
        console.error(`Error fetching commit details for ${owner}/${repo}/${sha}:`, e);
        return null;
    }
}

// Helper to analyze commit changes (size and blast radius)
async function analyzeCommitChanges(allUserCommits: any[], username: string, githubPat: string) {
    const totalCommitsToAnalyze = Math.min(allUserCommits.length, 50); // Limit to first 50 commits for detailed analysis
    const commitsForAnalysis = allUserCommits.slice(0, totalCommitsToAnalyze);

    const totalLinesChanged: number[] = [];
    const filesChangedCount: number[] = [];
    let giantCommits = 0;
    let manyFilesCommits = 0;

    for (const commit of commitsForAnalysis) {
        // Add a small delay to prevent hitting GitHub API rate limits too quickly
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay

        const details = await fetchCommitDetails(username, commit.repoName, commit.sha, githubPat);
        if (details) {
            const totalChanges = details.additions + details.deletions;
            totalLinesChanged.push(totalChanges);
            filesChangedCount.push(details.filesChanged);

            if (totalChanges > 500) { // Threshold for "Giant Commits"
                giantCommits++;
            }
            if (details.filesChanged > 30) { // Threshold for "Many Files Commits"
                manyFilesCommits++;
            }
        }
    }

    // Calculate metrics
    const totalLinesChangedMedian = calculateMedian(totalLinesChanged);
    const filesChangedCountMedian = calculateMedian(filesChangedCount);
    const giantCommitRatio = totalCommitsToAnalyze > 0 ? (giantCommits / totalCommitsToAnalyze) * 100 : 0;
    const manyFilesCommitRatio = totalCommitsToAnalyze > 0 ? (manyFilesCommits / totalCommitsToAnalyze) * 100 : 0;

    return {
        totalCommitsAnalyzed: totalCommitsToAnalyze,
        totalLinesChangedMedian,
        filesChangedCountMedian,
        giantCommitRatio,
        giantCommitsCount: giantCommits,
        manyFilesCommitRatio,
        manyFilesCommitsCount: manyFilesCommits,
    };
}

// Helper to analyze commit changes (size and blast radius)

// --- Handler for Recent Repositories Analysis (REST) ---
async function analyzeRecentRepos(username: string, githubPat: string) {
    const headers = { Authorization: `token ${githubPat}`, 'X-GitHub-Api-Version': '2022-11-28' };
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers, cache: 'no-store' });
    if (!userRes.ok) { if (userRes.status === 404) throw new Error('GitHub 사용자 이름이 존재하지 않습니다.'); throw new Error(`GitHub API 오류: ${userRes.statusText}`); }
    const userData = await userRes.json();
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?type=owner&sort=pushed&per_page=100`, { headers, cache: 'no-store' });
    if (!reposRes.ok) throw new Error(`리포지토리 조회 API 오류: ${reposRes.statusText}`);
    const reposData = await reposRes.json();
    const languageStats: { [k: string]: { bytes: number, color: string | null } } = {};
    const topRepos = reposData.filter((repo: any) => !repo.fork && repo.language).slice(0, 15); // Filter top 15 non-forked, language-defined repos
    await Promise.all(topRepos.map(async (repo: any) => {
        const langRes = await fetch(repo.languages_url, { headers, cache: 'no-store' });
        if (langRes.ok) {
            const langData = await langRes.json();
            for (const [lang, bytes] of Object.entries(langData)) {
                languageStats[lang] = { bytes: (languageStats[lang]?.bytes || 0) + (bytes as number), color: null };
            }
        }
    }));
    return { userData, languageStats, repoNodes: topRepos }; // Also return topRepos as repoNodes
}

// --- Handler for Pinned Repositories Analysis (GraphQL) ---
async function analyzePinnedRepos(username: string, githubPat: string) {
    console.log(`[DEBUG] Analyzing pinned repos for username: ${username}`);
    const graphqlQuery = { query: `query GetPinnedReposAndUserInfo($username: String!) { user(login: $username) { name login avatarUrl pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository { name languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } } } } } } }`, variables: { username } };
    const res = await fetch('https://api.github.com/graphql', { method: 'POST', headers: { Authorization: `bearer ${githubPat}`, 'Content-Type': 'application/json' }, body: JSON.stringify(graphqlQuery), cache: 'no-store' });
    if (!res.ok) { const d = await res.json(); throw new Error(`GitHub GraphQL API 오류: ${d.message||res.statusText}`); }
    const { data } = await res.json();
    if (!data.user) throw new Error('GitHub 사용자 이름이 존재하지 않습니다.');
    
    const languageStats: { [k: string]: { bytes: number, color: string | null } } = {};
    data.user.pinnedItems.nodes.forEach((repo: any) => {
        repo.languages.edges.forEach((edge: any) => {
            if (!edge.node) return;
            languageStats[edge.node.name] = { bytes: (languageStats[edge.node.name]?.bytes || 0) + edge.size, color: edge.node.color };
        });
    });
    return { userData: data.user, languageStats, repoNodes: data.user.pinnedItems.nodes };
}

// Helper to calculate standard deviation
const calculateStandardDeviation = (arr: number[], mean: number) => {
    if (arr.length === 0) return 0;
    const sumOfSquares = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    return Math.sqrt(sumOfSquares / arr.length);
};

// Helper to analyze commit rhythm and revert/hotfix signals
async function analyzeCommitRhythmAndSignals(allUserCommits: any[], weeklyCommitCounts: { [weekKey: string]: number }) {
    const totalCommits = allUserCommits.length;
    if (totalCommits === 0) {
        const analysisPeriodWeeks = 13; // Use the default for consistency
        return {
            totalCommits: 0,
            activityWeekCoverageRatio: 0,
            activeWeeksCount: 0,
            analysisPeriodWeeks: analysisPeriodWeeks,
            weeklyVolatility: 0,
            revertCommitRatio: 0,
            revertCommitsCount: 0,
            hotfixCommitRatio: 0,
            hotfixCommitsCount: 0,
        };
    }

    // Rhythm analysis
    const activeWeeks = Object.keys(weeklyCommitCounts).length;
    const analysisPeriodWeeks = 13; // Approximately 90 days
    const activityWeekCoverageRatio = (activeWeeks / analysisPeriodWeeks) * 100;

    const weeklyCommitCountsValues = Object.values(weeklyCommitCounts);
    const weeklyMean = weeklyCommitCountsValues.reduce((a, b) => a + b, 0) / weeklyCommitCountsValues.length;
    const weeklyStdDev = calculateStandardDeviation(weeklyCommitCountsValues, weeklyMean);
    const weeklyVolatility = weeklyMean > 0 ? (weeklyStdDev / weeklyMean) * 100 : 0;

    // Revert/Hotfix signals analysis
    let revertCommits = 0;
    let hotfixCommits = 0;
    const revertPattern = /^(revert|fixup! revert)/i;
    const hotfixPattern = /(hotfix|quick fix|urgent fix)/i;

    allUserCommits.forEach(commit => {
        const message = commit.commit.message || '';
        if (message.match(revertPattern)) {
            revertCommits++;
        }
        if (message.match(hotfixPattern)) {
            hotfixCommits++;
        }
    });

    const revertCommitRatio = (revertCommits / totalCommits) * 100;
    const hotfixCommitRatio = (hotfixCommits / totalCommits) * 100;

    return {
        totalCommits,
        activityWeekCoverageRatio,
        activeWeeksCount: activeWeeks,
        analysisPeriodWeeks,
        weeklyVolatility,
        revertCommitRatio,
        revertCommitsCount: revertCommits,
        hotfixCommitRatio,
        hotfixCommitsCount: hotfixCommits,
    };
}

// Helper to calculate median
const calculateMedian = (arr: number[]) => {
    if (arr.length === 0) return 0;
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
};

async function analyzeCommitMessages(allUserCommits: any[]) {
    const totalCommits = allUserCommits.length;
    if (totalCommits === 0) {
        return {
            totalCommits: 0,
            meaninglessCommitRatio: 0,
            meaninglessCommitsCount: 0,
            avgMessageLength: 0,
            medianMessageLength: 0,
            shortMessageRatio: 0,
            shortCommitsCount: 0,
            structuredCommitRatio: 0,
            structuredCommitsCount: 0,
        };
    }

    let meaninglessCommits = 0;
    let shortCommits = 0;
    let structuredCommits = 0;
    const messageLengths: number[] = [];

    // Patterns for analysis (refined based on new spec)
    const meaninglessTokens = new Set(['update', 'updates', 'fix', 'test', 'wip', 'temp', 'tmp', 'work', '.', '..', '...']);
    const conventionalCommitPattern = /^(feat|fix|build|chore|ci|docs|perf|refactor|revert|style|test)(\(.+\))?: (.+)/;
    const scopePattern = /\[.*?\]/;
    const issueRefPattern = /\(#\d+\)/;
    
    allUserCommits.forEach(commit => {
        const message = commit.commit.message || '';
        messageLengths.push(message.length);

        // Meaninglessness - Normalize message and check against tokens
        const normalizedMessage = message.toLowerCase().trim();
        // Check if the entire message (normalized) is one of the meaningless tokens
        if (meaninglessTokens.has(normalizedMessage)) {
            meaninglessCommits++;
        } else {
            // Further check for patterns like "update update", or "test1" if spec intends to catch
            // For now, sticking to the primary definition of exact token match or all meaningless tokens
            // The spec says "무의미 토큰”만으로 구성된 경우(공백/특수문자/숫자 제외 후)" - this is complex to handle perfectly
            // Let's refine the normalization for more robustness
            const cleanMessage = normalizedMessage.replace(/[^a-z]/g, ''); // Remove non-alpha chars for a stricter check
            if (meaninglessTokens.has(cleanMessage)) {
                // This would catch "update!" -> "update", "test1" -> "test" (if 'test' is in tokens)
                // This seems like a better interpretation of "무의미 토큰만으로 구성된 경우"
                 meaninglessCommits++;
            }
        }

        // Information Density (too short)
        if (message.length < 12) { // Threshold for "too short" messages
            shortCommits++;
        }

        // Structure
        if (message.match(conventionalCommitPattern) || message.match(scopePattern) || message.match(issueRefPattern)) {
            structuredCommits++;
        }
    });

    const meaninglessCommitRatio = (meaninglessCommits / totalCommits) * 100;
    const avgMessageLength = messageLengths.reduce((a, b) => a + b, 0) / totalCommits;
    const medianMessageLength = calculateMedian(messageLengths); // New: Calculate median
    const shortMessageRatio = (shortCommits / totalCommits) * 100;
    const structuredCommitRatio = (structuredCommits / totalCommits) * 100;

    return {
        totalCommits,
        meaninglessCommitRatio,
        meaninglessCommitsCount: meaninglessCommits,
        avgMessageLength,
        medianMessageLength,
        shortMessageRatio,
        shortCommitsCount: shortCommits,
        structuredCommitRatio,
        structuredCommitsCount: structuredCommits,
    };
}

async function analyzeCommitsForRepos(username: string, repos: any[], githubPat: string) {
    const headers = { Authorization: `token ${githubPat}`, 'X-GitHub-Api-Version': '2022-11-28' };
    let allUserCommits: any[] = [];

    for (const repo of repos) {
        if (!repo || !repo.name) continue;
        try {
            for (let page = 1; page <= 2; page++) { // Fetch up to 2 pages (200 commits)
                const commitsRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/commits?author=${username}&per_page=100&page=${page}`, { headers, cache: 'no-store' });
                if (!commitsRes.ok) break;
                const commits = await commitsRes.json();
                if (commits.length === 0) break;
                // Add repo name to each commit object for later use
                allUserCommits = allUserCommits.concat(commits.map((c: any) => ({ ...c, repoName: repo.name })));
            }
        } catch(e) {
            console.error(`Failed to fetch commits for repo ${repo.name}:`, e);
        }
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Filter commits to include only those within the last 90 days
    allUserCommits = allUserCommits.filter(commit => {
        const commitDate = new Date(commit.commit.author.date);
        return commitDate >= ninetyDaysAgo;
    });

    const totalCommitsInScope = allUserCommits.length;

    if (totalCommitsInScope < 20) {
        return {
            allUserCommits: [],
            punchcard: Array(7).fill(0).map(() => Array(24).fill(0)),
            longestStreak: 0,
            busiestDay: { date: 'N/A', count: 0 },
            weeklyCommitCounts: {},
            // These properties are not used by the GET handler for code quality,
            // but are part of the original return from this function for activity stats.
            // Keeping them for type consistency if this function were used elsewhere.
            consistency: "활동 정보 부족",
            commitFrequency: "분석할 커밋 20개 미만",
            mainActivityDay: "N/A",
            mainActivityTime: "N/A",
        };
    }
    
    const commitsByDay = Array(7).fill(0).map(() => Array(24).fill(0)); // punchcard data
    const commitDates = new Set<string>(); // for streak and busiest day
    const dailyCommitCounts: { [date: string]: number } = {}; // for streak and busiest day
    const weeklyCommitCounts: { [weekKey: string]: number } = {}; // for rhythm

    allUserCommits.forEach(commit => {
        const eventDate = new Date(commit.commit.author.date);
        const kstTime = new Date(eventDate.getTime() + (9 * 60 * 60 * 1000)); // Convert to KST
        
        const kstHour = kstTime.getUTCHours();
        const kstDay = kstTime.getUTCDay();

        commitsByDay[kstDay][kstHour]++; // Populate punchcard
        
        const dateString = kstTime.toISOString().split('T')[0];
        commitDates.add(dateString);
        dailyCommitCounts[dateString] = (dailyCommitCounts[dateString] || 0) + 1;

        const year = kstTime.getUTCFullYear();
        const startOfYear = new Date(year, 0, 1);
        const dayOfYear = Math.floor((kstTime.getTime() - startOfYear.getTime()) / 86400000);
        const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
        const weekKey = `${year}-W${weekNumber}`;
        weeklyCommitCounts[weekKey] = (weeklyCommitCounts[weekKey] || 0) + 1;
    });

    // Calculate longest streak and busiest day
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

    return { allUserCommits, punchcard: commitsByDay, longestStreak, busiestDay, weeklyCommitCounts };
}


export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    // Correctly extract the username which is the segment before 'code_quality'
    const pathSegments = url.pathname.split('/');
    const username = pathSegments[pathSegments.length - 2];
    const method = url.searchParams.get('method') || 'pinned'; // Get method from URL
    const githubPat = process.env.GITHUB_PAT;

    if (!githubPat) {
        return NextResponse.json({ error: 'GitHub PAT가 서버에 설정되지 않았습니다.' }, { status: 500 });
    }

    try {
        let repoNodes: any[] = [];
        if (method === 'recent') {
            const { repoNodes: recentRepoNodes } = await analyzeRecentRepos(username, githubPat);
            repoNodes = recentRepoNodes;
        } else { // default to 'pinned'
            const { repoNodes: pinnedRepoNodes } = await analyzePinnedRepos(username, githubPat);
            repoNodes = pinnedRepoNodes;
        }
        
        const { allUserCommits, weeklyCommitCounts } = await analyzeCommitsForRepos(username, repoNodes, githubPat);
        const commitMessageAnalysis = await analyzeCommitMessages(allUserCommits);
        const commitChangeAnalysis = await analyzeCommitChanges(allUserCommits, username, githubPat);
        const commitRhythmAndSignals = await analyzeCommitRhythmAndSignals(allUserCommits, weeklyCommitCounts);

        const detailedMetrics: DetailedMetrics = {
            totalCommits: commitMessageAnalysis.totalCommits,
            meaninglessCommitRatio: commitMessageAnalysis.meaninglessCommitRatio,
            meaninglessCommitsCount: commitMessageAnalysis.meaninglessCommitsCount,
            avgMessageLength: commitMessageAnalysis.avgMessageLength,
            medianMessageLength: commitMessageAnalysis.medianMessageLength,
            shortMessageRatio: commitMessageAnalysis.shortMessageRatio,
            shortCommitsCount: commitMessageAnalysis.shortCommitsCount,
            structuredCommitRatio: commitMessageAnalysis.structuredCommitRatio,
            structuredCommitsCount: commitMessageAnalysis.structuredCommitsCount,
            totalLinesChangedMedian: commitChangeAnalysis.totalLinesChangedMedian,
            giantCommitRatio: commitChangeAnalysis.giantCommitRatio,
            giantCommitsCount: commitChangeAnalysis.giantCommitsCount,
            filesChangedCountMedian: commitChangeAnalysis.filesChangedCountMedian,
            manyFilesCommitRatio: commitChangeAnalysis.manyFilesCommitRatio,
            manyFilesCommitsCount: commitChangeAnalysis.manyFilesCommitsCount,
            activityWeekCoverageRatio: commitRhythmAndSignals.activityWeekCoverageRatio,
            activeWeeksCount: commitRhythmAndSignals.activeWeeksCount,
            analysisPeriodWeeks: commitRhythmAndSignals.analysisPeriodWeeks,
            weeklyVolatility: commitRhythmAndSignals.weeklyVolatility,
            revertCommitRatio: commitRhythmAndSignals.revertCommitRatio,
            revertCommitsCount: commitRhythmAndSignals.revertCommitsCount,
            hotfixCommitRatio: commitRhythmAndSignals.hotfixCommitRatio,
            hotfixCommitsCount: commitRhythmAndSignals.hotfixCommitsCount,
        };

        const totalCommits = detailedMetrics.totalCommits;
        let scores: QualityScore[];

        if (totalCommits < 5) { // If there's not enough data, all scores are 0
            scores = [
                { subject: '의미도', score: 0, fullMark: 100 },
                { subject: '정보량', score: 0, fullMark: 100 },
                { subject: '구조화', score: 0, fullMark: 100 },
                { subject: '작업분할', score: 0, fullMark: 100 },
                { subject: '변경범위', score: 0, fullMark: 100 },
                { subject: '리듬', score: 0, fullMark: 100 },
            ];
        } else {
            const meaningfulnessScore = Math.round(100 - detailedMetrics.meaninglessCommitRatio);
            const rhythmScore = Math.min(100, Math.round(detailedMetrics.activityWeekCoverageRatio)); // Cap at 100
            scores = [
                { subject: '의미도', score: meaningfulnessScore, fullMark: 100 },
                { subject: '정보량', score: Math.round(100 - detailedMetrics.shortMessageRatio), fullMark: 100 },
                { subject: '구조화', score: Math.round(detailedMetrics.structuredCommitRatio), fullMark: 100 },
                { subject: '작업분할', score: Math.round(100 - detailedMetrics.giantCommitRatio), fullMark: 100 },
                { subject: '변경범위', score: Math.round(100 - detailedMetrics.manyFilesCommitRatio), fullMark: 100 },
                { subject: '리듬', score: rhythmScore, fullMark: 100 },
            ];
        }

        const confidence = Math.min(1, totalCommits / 50);
        const periodDays = 90; // As per spec

        const simpleCommits = allUserCommits.map((c: any) => ({
            sha: c.sha,
            message: c.commit.message,
            date: c.commit.author.date,
            html_url: c.html_url,
        }));

        const qualityData: CodeQualityData = {
            confidence: confidence,
            periodDays: periodDays,
            scores: scores,
            codeSmells: [],
            detailedMetrics: detailedMetrics,
            commits: simpleCommits,
        };

        // Add code smells based on commit message analysis
        if (commitMessageAnalysis.meaninglessCommitRatio > 30) {
            qualityData.codeSmells.push({
                type: '의미 없는 커밋 메시지',
                description: `총 ${detailedMetrics.totalCommits}개의 커밋 중 ${detailedMetrics.meaninglessCommitsCount}개 (${Math.round(commitMessageAnalysis.meaninglessCommitRatio)}%)가 "update", "fix"와 같은 의미 없는 메시지 패턴을 포함합니다.`,
                severity: 'Minor'
            });
        }
        if (commitMessageAnalysis.shortMessageRatio > 40) {
            qualityData.codeSmells.push({
                type: '너무 짧은 커밋 메시지',
                description: `총 ${detailedMetrics.totalCommits}개의 커밋 중 ${detailedMetrics.shortCommitsCount}개 (${Math.round(commitMessageAnalysis.shortMessageRatio)}%)가 12자 미만의 짧은 메시지입니다. 평균 메시지 길이는 ${Math.round(detailedMetrics.avgMessageLength)}자입니다.`,
                severity: 'Minor'
            });
        }
        if (commitMessageAnalysis.structuredCommitRatio < 50) {
            qualityData.codeSmells.push({
                type: '낮은 커밋 메시지 구조화 비율',
                description: `총 ${detailedMetrics.totalCommits}개의 커밋 중 ${detailedMetrics.structuredCommitsCount}개 (${Math.round(commitMessageAnalysis.structuredCommitRatio)}%)만이 Conventional Commits와 같은 구조화된 메시지 패턴을 따릅니다.`,
                severity: 'Minor'
            });
        }

        // Add code smells based on commit change analysis
        if (commitChangeAnalysis.giantCommitRatio > 20) {
            qualityData.codeSmells.push({
                type: '거대 커밋 빈번',
                description: `분석된 총 ${detailedMetrics.totalCommits}개의 커밋 중 ${detailedMetrics.giantCommitsCount}개 (${Math.round(commitChangeAnalysis.giantCommitRatio)}%)가 500라인 이상을 변경합니다. 평균 변경 라인 수는 ${Math.round(detailedMetrics.totalLinesChangedMedian)}라인입니다.`,
                severity: 'Major'
            });
        }
        if (commitChangeAnalysis.manyFilesCommitRatio > 15) {
            qualityData.codeSmells.push({
                type: '광범위한 파일 변경',
                description: `분석된 총 ${detailedMetrics.totalCommits}개의 커밋 중 ${detailedMetrics.manyFilesCommitsCount}개 (${Math.round(commitChangeAnalysis.manyFilesCommitRatio)}%)가 30개 이상의 파일을 변경합니다. 평균 변경 파일 수는 ${Math.round(detailedMetrics.filesChangedCountMedian)}개입니다.`,
                severity: 'Major'
            });
        }

        // Add code smells based on rhythm and signal analysis
        if (commitRhythmAndSignals.weeklyVolatility > 100) { // Arbitrary threshold for high volatility
            qualityData.codeSmells.push({
                type: '불규칙한 커밋 리듬',
                description: `지난 ${detailedMetrics.analysisPeriodWeeks}주간 활동에서 주간 커밋 활동의 변동성이 높습니다 (${Math.round(commitRhythmAndSignals.weeklyVolatility)}%).`,
                severity: 'Minor'
            });
        }
        if (commitRhythmAndSignals.revertCommitRatio > 5) { // Arbitrary threshold
            qualityData.codeSmells.push({
                type: '잦은 커밋 되돌리기',
                description: `총 ${detailedMetrics.totalCommits}개의 커밋 중 ${detailedMetrics.revertCommitsCount}개 (${Math.round(commitRhythmAndSignals.revertCommitRatio)}%)가 되돌리기 커밋입니다.`,
                severity: 'Minor'
            });
        }
        if (commitRhythmAndSignals.hotfixCommitRatio > 3) { // Arbitrary threshold
            qualityData.codeSmells.push({
                type: '잦은 급한 수정',
                description: `총 ${detailedMetrics.totalCommits}개의 커밋 중 ${detailedMetrics.hotfixCommitsCount}개 (${Math.round(commitRhythmAndSignals.hotfixCommitRatio)}%)가 핫픽스/급한 수정 커밋입니다.`,
                severity: 'Minor'
            });
        }


        return NextResponse.json(qualityData);

    } catch (error: any) {
        console.error('Error fetching GitHub data for code quality:', error.message);
        return NextResponse.json({ error: error.message || '알 수 없는 서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
