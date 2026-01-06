import { NextRequest, NextResponse } from 'next/server';
import { CollaborationData, RepoClassification, CollaborationMetrics } from '@/app/types';

const calculateMedian = (arr: number[]) => {
    if (arr.length === 0) return 0;
    arr.sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
};

async function analyzePinnedRepos(username: string, githubPat: string) {
    const graphqlQuery = { query: `query GetPinnedRepos($username: String!) { user(login: $username) { pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository { name } } } } }`, variables: { username } };
    const res = await fetch('https://api.github.com/graphql', { method: 'POST', headers: { Authorization: `bearer ${githubPat}`, 'Content-Type': 'application/json' }, body: JSON.stringify(graphqlQuery), cache: 'no-store' });
    if (!res.ok) { const d = await res.json(); throw new Error(`GitHub GraphQL API 오류: ${d.message||res.statusText}`); }
    const { data } = await res.json();
    if (!data.user) throw new Error('GitHub 사용자 이름이 존재하지 않습니다.');
    return { repoNodes: data.user.pinnedItems.nodes };
}

async function analyzeRecentRepos(username: string, githubPat: string) {
    const headers = { Authorization: `token ${githubPat}`, 'X-GitHub-Api-Version': '2022-11-28' };
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?type=owner&sort=pushed&per_page=15`, { headers, cache: 'no-store' });
    if (!reposRes.ok) throw new Error(`리포지토리 조회 API 오류: ${reposRes.statusText}`);
    const reposData = await reposRes.json();
    const repoNodes = reposData.filter((repo: any) => !repo.fork);
    return { repoNodes };
}

async function getRepoData(username: string, githubPat: string, method: string) {
    if (method === 'recent') {
        const { repoNodes } = await analyzeRecentRepos(username, githubPat);
        return repoNodes;
    } else { // default to 'pinned'
        const { repoNodes } = await analyzePinnedRepos(username, githubPat);
        return repoNodes;
    }
}

// Helper to classify repo as Team or Solo
async function classifyRepo(repoOwner: string, repoName: string, githubPat: string, ninetyDaysAgo: Date): Promise<{ classification: RepoClassification; recentPrs: any[] }> {
    const headers = { Authorization: `token ${githubPat}` };
    const prsRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls?state=all&per_page=100`, { headers, cache: 'no-store' });
    let classification: RepoClassification = 'Solo';
    let recentPrs: any[] = [];

    if (prsRes.ok) {
        try {
            const prs: any[] = await prsRes.json();
            recentPrs = prs.filter(pr => new Date(pr.created_at) >= ninetyDaysAgo);

            const uniqueAuthors = new Set(recentPrs.map(pr => pr.user?.login).filter(Boolean));
            if (uniqueAuthors.size >= 2) {
                classification = 'Team';
            }
        } catch (e: any) {
            console.error(`Error parsing PRs JSON for ${repoOwner}/${repoName}: ${e.message}`);
            // Log raw response text if JSON parsing fails
            try {
                const rawText = await prsRes.text();
                console.error(`Raw PRs response for ${repoOwner}/${repoName}: ${rawText}`);
            } catch (textErr) {
                console.error(`Failed to get raw text for PRs response for ${repoOwner}/${repoName}: ${textErr}`);
            }
            // If JSON parsing fails, treat as Solo or no recent PRs
            classification = 'Solo';
            recentPrs = [];
        }
    } else {
        console.error(`Failed to fetch PRs for ${repoOwner}/${repoName}: Status ${prsRes.status} - ${prsRes.statusText}`);
    }
    return { classification, recentPrs };
}

// Helper to get PR Metrics
async function getPrMetrics(repoOwner: string, repoName: string, githubPat: string, recentPrs: any[], ninetyDaysAgo: Date): Promise<{ prOpenedCount: number; prMergedCount: number; prSizeLinesMedian: number | 'N/A'; prSizeFilesMedian: number | 'N/A'; prLeadTimeMedianHours: number | 'N/A'; }> {
    const headers = { Authorization: `token ${githubPat}` };
    const prOpenedCount = recentPrs.length;
    const prMergedCount = recentPrs.filter(pr => pr.merged_at).length;

    const linesChangedList: number[] = [];
    const filesChangedList: number[] = [];
    const leadTimes: number[] = []; // in hours

    const prsToAnalyze = recentPrs.slice(0, 20); // Limit detailed PR analysis to recent 20 PRs for performance

    for (const pr of prsToAnalyze) {
        // Fetch full PR details for additions/deletions/filesChanged and merged_at
        const prDetailsRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${pr.number}`, { headers, cache: 'no-store' });
        if (prDetailsRes.ok) {
            try {
                const prDetails = await prDetailsRes.json();
                if (prDetails.additions !== undefined && prDetails.deletions !== undefined) {
                    linesChangedList.push(prDetails.additions + prDetails.deletions);
                }
                if (prDetails.changed_files !== undefined) {
                    filesChangedList.push(prDetails.changed_files);
                }

                if (prDetails.created_at && prDetails.merged_at) {
                    const created = new Date(prDetails.created_at).getTime();
                    const merged = new Date(prDetails.merged_at).getTime();
                    leadTimes.push((merged - created) / (1000 * 60 * 60)); // Convert ms to hours
                } else if (prDetails.created_at && prDetails.closed_at && !prDetails.merged_at) { // closed without merge
                     const created = new Date(prDetails.created_at).getTime();
                     const closed = new Date(prDetails.closed_at).getTime();
                     leadTimes.push((closed - created) / (1000 * 60 * 60)); // Convert ms to hours
                }
            } catch (e: any) {
                console.error(`Error parsing PR details JSON for ${repoOwner}/${repoName} PR #${pr.number}: ${e.message}`);
                try {
                    const rawText = await prDetailsRes.text();
                    console.error(`Raw PR details response for ${repoOwner}/${repoName} PR #${pr.number}: ${rawText}`);
                } catch (textErr) {
                    console.error(`Failed to get raw text for PR details response for ${repoOwner}/${repoName} PR #${pr.number}: ${textErr}`);
                }
            }
        } else {
            console.error(`Failed to fetch PR details for ${repoOwner}/${repoName} PR #${pr.number}: Status ${prDetailsRes.status} - ${prDetailsRes.statusText}`);
        }
    }

    return {
        prOpenedCount,
        prMergedCount,
        prSizeLinesMedian: linesChangedList.length > 0 ? calculateMedian(linesChangedList) : 'N/A',
        prSizeFilesMedian: filesChangedList.length > 0 ? calculateMedian(filesChangedList) : 'N/A',
        prLeadTimeMedianHours: leadTimes.length > 0 ? calculateMedian(leadTimes) : 'N/A',
    };
}

// Helper to get Review Metrics
async function getReviewMetrics(repoOwner: string, repoName: string, githubPat: string, recentPrs: any[]): Promise<{ reviewedPrCount: number | 'N/A'; reviewCommentCount: number | 'N/A'; }> {
    const headers = { Authorization: `token ${githubPat}` };
    let reviewCommentCount = 0;
    let reviewedPrCount = 0;
    const reviewedPrs = new Set();

    for (const pr of recentPrs) {
        const reviewsRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${pr.number}/reviews?per_page=100`, { headers, cache: 'no-store' });
        if (reviewsRes.ok) {
            try {
                const reviews = await reviewsRes.json();
                const commentsRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${pr.number}/comments?per_page=100`, { headers, cache: 'no-store' });
                let comments: any[] = [];
                if (commentsRes.ok) {
                    try {
                        comments = await commentsRes.json();
                    } catch (e: any) {
                        console.error(`Error parsing PR comments JSON for ${repoOwner}/${repoName} PR #${pr.number}: ${e.message}`);
                        try {
                            const rawText = await commentsRes.text();
                            console.error(`Raw PR comments response for ${repoOwner}/${repoName} PR #${pr.number}: ${rawText}`);
                        } catch (textErr) {
                            console.error(`Failed to get raw text for PR comments response for ${repoOwner}/${repoName} PR #${pr.number}: ${textErr}`);
                        }
                    }
                } else {
                    console.error(`Failed to fetch PR comments for ${repoOwner}/${repoName} PR #${pr.number}: Status ${commentsRes.status} - ${commentsRes.statusText}`);
                }

                const userReviews = reviews.filter((r: any) => r.user?.login === repoOwner);
                const userComments = comments.filter((c: any) => c.user?.login === repoOwner);

                if (userReviews.length > 0 || userComments.length > 0) {
                    reviewedPrs.add(pr.number);
                }
                reviewCommentCount += userReviews.length; // Count review submissions as comments for simplicity
                reviewCommentCount += userComments.length; // Count individual comments
            } catch (e: any) {
                console.error(`Error parsing PR reviews JSON for ${repoOwner}/${repoName} PR #${pr.number}: ${e.message}`);
                try {
                    const rawText = await reviewsRes.text();
                    console.error(`Raw PR reviews response for ${repoOwner}/${repoName} PR #${pr.number}: ${rawText}`);
                } catch (textErr) {
                    console.error(`Failed to get raw text for PR reviews response for ${repoOwner}/${repoName} PR #${pr.number}: ${textErr}`);
                }
            }
        } else {
            console.error(`Failed to fetch PR reviews for ${repoOwner}/${repoName} PR #${pr.number}: Status ${reviewsRes.status} - ${reviewsRes.statusText}`);
        }
    }

    reviewedPrCount = reviewedPrs.size;

    return {
        reviewedPrCount: reviewedPrCount === 0 ? 'N/A' : reviewedPrCount,
        reviewCommentCount: reviewCommentCount === 0 ? 'N/A' : reviewCommentCount,
    };
}

// Helper to get Issue Metrics
async function getIssueMetrics(repoOwner: string, repoName: string, githubPat: string, ninetyDaysAgo: Date): Promise<{ issuesOpenedCount: number | 'N/A'; issuesClosedCount: number | 'N/A'; issueCommentCount: number | 'N/A'; }> {
    const headers = { Authorization: `token ${githubPat}` };
    let issuesOpenedCount = 0;
    let issuesClosedCount = 0;
    let issueCommentCount = 0;

    const issuesRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues?state=all&since=${ninetyDaysAgo.toISOString()}&per_page=100`, { headers, cache: 'no-store' });
    if (issuesRes.ok) {
        try {
            const issues: any[] = await issuesRes.json();
            issuesOpenedCount = issues.filter(issue => issue.user?.login === repoOwner).length;
            issuesClosedCount = issues.filter(issue => issue.user?.login === repoOwner && issue.state === 'closed').length;

            for (const issue of issues) {
                const commentsRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issue.number}/comments?per_page=100`, { headers, cache: 'no-store' });
                if (commentsRes.ok) {
                    try {
                        const comments: any[] = await commentsRes.json();
                        issueCommentCount += comments.filter(comment => comment.user?.login === repoOwner).length;
                    } catch (e: any) {
                        console.error(`Error parsing issue comments JSON for ${repoOwner}/${repoName} issue #${issue.number}: ${e.message}`);
                        try {
                            const rawText = await commentsRes.text();
                            console.error(`Raw issue comments response for ${repoOwner}/${repoName} issue #${issue.number}: ${rawText}`);
                        } catch (textErr) {
                            console.error(`Failed to get raw text for issue comments response for ${repoOwner}/${repoName} issue #${issue.number}: ${textErr}`);
                        }
                    }
                } else {
                    console.error(`Failed to fetch issue comments for ${repoOwner}/${repoName} issue #${issue.number}: Status ${commentsRes.status} - ${commentsRes.statusText}`);
                }
            }
        } catch (e: any) {
            console.error(`Error parsing issues JSON for ${repoOwner}/${repoName}: ${e.message}`);
            try {
                const rawText = await issuesRes.text();
                console.error(`Raw issues response for ${repoOwner}/${repoName}: ${rawText}`);
            } catch (textErr) {
                console.error(`Failed to get raw text for issues response for ${repoOwner}/${repoName}: ${textErr}`);
            }
        }
    } else {
        console.error(`Failed to fetch issues for ${repoOwner}/${repoName}: Status ${issuesRes.status} - ${issuesRes.statusText}`);
    }

    return {
        issuesOpenedCount: issuesOpenedCount === 0 ? 'N/A' : issuesOpenedCount,
        issuesClosedCount: issuesClosedCount === 0 ? 'N/A' : issuesClosedCount,
        issueCommentCount: issueCommentCount === 0 ? 'N/A' : issueCommentCount,
    };
}

// Helper to get Co-authored-by Metrics
async function getCoAuthoredByMetrics(repoOwner: string, repoName: string, githubPat: string, ninetyDaysAgo: Date): Promise<{ coAuthoredByDetected: boolean }> {
    const headers = { Authorization: `token ${githubPat}` };
    const commitsRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/commits?author=${repoOwner}&since=${ninetyDaysAgo.toISOString()}&per_page=100`, { headers, cache: 'no-store' });
    let coAuthoredByDetected = false;
    if (commitsRes.ok) {
        try {
            const commits: any[] = await commitsRes.json();
            coAuthoredByDetected = commits.some(commit => commit.commit?.message?.includes('Co-authored-by:'));
        } catch (e: any) {
            console.error(`Error parsing commits JSON for ${repoOwner}/${repoName}: ${e.message}`);
            try {
                const rawText = await commitsRes.text();
                console.error(`Raw commits response for ${repoOwner}/${repoName}: ${rawText}`);
            } catch (textErr) {
                console.error(`Failed to get raw text for commits response for ${repoOwner}/${repoName}: ${textErr}`);
            }
        }
    } else {
        console.error(`Failed to fetch commits for ${repoOwner}/${repoName}: Status ${commitsRes.status} - ${commitsRes.statusText}`);
    }
    return { coAuthoredByDetected };
}


// Main GET Handler for Collaboration Style
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const username = pathSegments[pathSegments.length - 2];
    const githubPat = process.env.GITHUB_PAT;

    if (!githubPat) {
        return NextResponse.json({ error: 'GitHub PAT가 서버에 설정되지 않았습니다.' }, { status: 500 });
    }

    try {
        const method = url.searchParams.get('method') || 'pinned'; // 'pinned' or 'recent'
        const repoNodes = await getRepoData(username, githubPat, method); // Use helper to get repos

        const collaborationData: CollaborationData = {
            totalTeamRepos: 0,
            totalSoloRepos: 0,
            repoAnalyses: [],
        };

        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        for (const repo of repoNodes) {
            if (!repo || !repo.name) continue; // Basic check

            const { classification, recentPrs } = await classifyRepo(username, repo.name, githubPat, ninetyDaysAgo);

            // Fetch all metrics, N/A if not a Team repo
            const metrics: CollaborationMetrics = {
                prOpenedCount: 'N/A', prMergedCount: 'N/A', prSizeLinesMedian: 'N/A', prSizeFilesMedian: 'N/A', prLeadTimeMedianHours: 'N/A',
                reviewedPrCount: 'N/A', reviewCommentCount: 'N/A',
                issuesOpenedCount: 'N/A', issuesClosedCount: 'N/A', issueCommentCount: 'N/A',
                coAuthoredByDetected: false,
            };

            if (classification === 'Team') {
                const prMetrics = await getPrMetrics(username, repo.name, githubPat, recentPrs, ninetyDaysAgo);
                const reviewMetrics = await getReviewMetrics(username, repo.name, githubPat, recentPrs);
                const issueMetrics = await getIssueMetrics(username, repo.name, githubPat, ninetyDaysAgo);
                const coAuthoredMetrics = await getCoAuthoredByMetrics(username, repo.name, githubPat, ninetyDaysAgo);

                Object.assign(metrics, prMetrics, reviewMetrics, issueMetrics, coAuthoredMetrics);
            }

            collaborationData.repoAnalyses.push({
                repoName: repo.name,
                classification: classification,
                metrics: metrics,
            });

            if (classification === 'Team') {
                collaborationData.totalTeamRepos++;
            } else {
                collaborationData.totalSoloRepos++;
            }
        }
        return NextResponse.json(collaborationData);

    } catch (error: any) {
        console.error('Error fetching GitHub collaboration data:', error.message);
        return NextResponse.json({ error: error.message || '알 수 없는 서버 오류가 발생했습니다.' }, { status: 500 });
    }
}
