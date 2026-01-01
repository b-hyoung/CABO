import { NextRequest, NextResponse } from 'next/server';

// Common data structures and mock data
const mockTier = {
    tier: "Expert",
    tierColor: "text-blue-500",
    tierIcon: "🔵",
    tierDescription: "1인분은 거뜬히 해내는 든든한 팀원",
};
const mockStats = {
    consistency: "꾸준한 마라토너",
    commitFrequency: "주 평균 15회",
    codeQualityScore: 88,
    maintainability: "상",
    communicationScore: 92,
    teamworkStyle: "긍정적 피드백",
};
const mockBadges = [
    { name: '까보냥', description: 'CABO 첫 분석 완료!', icon: '🐱' }
];

// --- Handler for Pinned Repositories Analysis (GraphQL) ---
async function analyzePinnedRepos(username: string, githubPat: string) {
    const graphqlQuery = {
        query: `
          query GetPinnedReposAndUserInfo($username: String!) {
            user(login: $username) {
              name
              login
              avatarUrl
              pinnedItems(first: 6, types: REPOSITORY) {
                nodes {
                  ... on Repository {
                    name
                    languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                      edges {
                        size
                        node {
                          name
                          color
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { username },
    };

    const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `bearer ${githubPat}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(graphqlQuery),
        cache: 'no-store',
    });

    if (!res.ok) {
        const errorBody = await res.json();
        throw new Error(`GitHub GraphQL API 오류: ${errorBody.message || res.statusText}`);
    }

    const { data } = await res.json();
    const userData = data.user;

    if (!userData) {
        throw new Error('GitHub 사용자 이름이 존재하지 않습니다.');
    }

    const languageStats: { [key: string]: { bytes: number, color: string | null } } = {};
    userData.pinnedItems.nodes.forEach((repo: any) => {
        repo.languages.edges.forEach((edge: any) => {
            if (!edge.node) return;
            languageStats[edge.node.name] = {
                bytes: (languageStats[edge.node.name]?.bytes || 0) + edge.size,
                color: edge.node.color,
            };
        });
    });
    
    return { userData, languageStats };
}

// --- Handler for Recent Repositories Analysis (REST) ---
async function analyzeRecentRepos(username: string, githubPat: string) {
    const headers = { Authorization: `token ${githubPat}`, 'X-GitHub-Api-Version': '2022-11-28' };

    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers, cache: 'no-store' });
    if (!userRes.ok) {
        if (userRes.status === 404) throw new Error('GitHub 사용자 이름이 존재하지 않습니다.');
        throw new Error(`GitHub API 오류: ${userRes.statusText}`);
    }
    const userData = await userRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?type=owner&sort=pushed&per_page=100`, { headers, cache: 'no-store' });
    if (!reposRes.ok) throw new Error(`리포지토리 조회 API 오류: ${reposRes.statusText}`);
    const reposData = await reposRes.json();

    const languageStats: { [key: string]: { bytes: number, color: string | null } } = {};
    const topRepos = reposData.filter((repo: any) => !repo.fork && repo.language).slice(0, 15);

    await Promise.all(topRepos.map(async (repo: any) => {
        const langRes = await fetch(repo.languages_url, { headers, cache: 'no-store' });
        if (langRes.ok) {
            const langData = await langRes.json();
            for (const [lang, bytes] of Object.entries(langData)) {
                 languageStats[lang] = {
                    bytes: (languageStats[lang]?.bytes || 0) + (bytes as number),
                    color: null // REST API for languages doesn't provide color
                };
            }
        }
    }));

    return { userData, languageStats };
}


// --- Main GET Handler ---
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const url = new URL(request.url);
  const username = url.pathname.split('/').pop()!;
  const method = url.searchParams.get('method') || 'pinned'; // Default to 'pinned'

  const githubPat = process.env.GITHUB_PAT;
  if (!githubPat) {
    return NextResponse.json({ error: 'GitHub PAT가 서버에 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    let userData: any;
    let languageStats: { [key: string]: { bytes: number, color: string | null } };

    if (method === 'recent') {
      ({ userData, languageStats } = await analyzeRecentRepos(username, githubPat));
    } else { // Default to 'pinned'
      ({ userData, languageStats } = await analyzePinnedRepos(username, githubPat));
    }

    const totalBytes = Object.values(languageStats).reduce((sum, lang) => sum + lang.bytes, 0);
    const topLanguages = Object.entries(languageStats)
      .sort(([, a], [, b]) => b.bytes - a.bytes)
      .slice(0, 3)
      .map(([name, { bytes, color }]) => ({
        name,
        percentage: totalBytes > 0 ? parseFloat(((bytes / totalBytes) * 100).toFixed(1)) : 0,
        color: color || `hsl(${Math.random() * 360}, 70%, 50%)`,
      }));

    return NextResponse.json({
      name: userData.name || userData.login,
      githubHandle: userData.login,
      avatarUrl: userData.avatarUrl || userData.avatar_url,
      ...mockTier,
      stats: mockStats,
      languages: topLanguages,
      badges: mockBadges,
    });

  } catch (error: any) {
    console.error('Error fetching GitHub data:', error.message);
    return NextResponse.json({ error: error.message || '알 수 없는 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}