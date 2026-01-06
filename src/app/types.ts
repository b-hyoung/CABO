export interface QualityScore {
  subject: string;
  score: number;
  fullMark: number;
}

export interface CodeSmell {
  type: string;
  description: string;
  severity: 'Major' | 'Minor';
}

export interface DetailedMetrics {
  totalCommits: number;

  // Meaningfulness
  meaninglessCommitRatio: number;
  meaninglessCommitsCount: number;

  // Information Density
  avgMessageLength: number;
  medianMessageLength: number; // Added as per spec
  shortMessageRatio: number;
  shortCommitsCount: number;

  // Structure
  structuredCommitRatio: number;
  structuredCommitsCount: number;

  // Commit Size Hygiene
  totalLinesChangedMedian: number;
  giantCommitRatio: number;
  giantCommitsCount: number;

  // Blast Radius
  filesChangedCountMedian: number;
  manyFilesCommitRatio: number;
  manyFilesCommitsCount: number;

  // Rhythm
  activityWeekCoverageRatio: number;
  activeWeeksCount: number;
  analysisPeriodWeeks: number;
  weeklyVolatility: number;

  // Revert/Hotfix Signals
  revertCommitRatio: number;
  revertCommitsCount: number;
  hotfixCommitRatio: number;
  hotfixCommitsCount: number;
}

export interface SimpleCommit {
  sha: string;
  message: string;
  date: string;
  html_url: string;
}

export interface CodeQualityData {
  confidence: number;
  periodDays: number;
  scores: QualityScore[];
  codeSmells: CodeSmell[];
  detailedMetrics: DetailedMetrics;
  commits?: SimpleCommit[];
}

export interface DeveloperData {
  name: string;
  githubHandle: string;
  avatarUrl: string;
  tier: string;
  tierColor: string;
  tierIcon: string;
  tierDescription: string;
  stats: {
    consistency: string;
    commitFrequency: string;
    mainActivityDay: string;
    mainActivityTime: string;
    punchcard?: number[][];
    longestStreak?: number;
    busiestDay?: { date: string, count: number };
  };
  languages: { name: string; percentage: number; color: string }[];
  badges: { name: string; description: string; icon: string }[];
}

export const personaTypes: { [key: string]: string } = {
  "꾸준한 마라토너 🏃": "매주 꾸준히 커밋하는 성실한 타입입니다.",
  "벼락치기 빌런 ⚡️": "특정 기간에 커밋이 몰려있는 집중력이 좋은 타입입니다.",
  "주말 용사 💪": "주말을 활용해 사이드 프로젝트나 공부를 하는 타입입니다.",
  "새벽반 올빼미 🦉": "주로 새벽 시간대에 활동하는 집중력이 좋은 타입입니다.",
  "오전형 인간 ☀️": "아침 일찍부터 활동을 시작하는 부지런한 타입입니다.",
  "인간 스케줄러 🤖": "매우 규칙적인 시간대에 커밋하는 계획적인 타입입니다.",
  "공개 활동 정보 부족": "최근 90일간 공개 커밋이 충분하지 않아 분석이 어렵습니다.",
  "분석 실패": "데이터를 분석하는 데 실패했습니다.",
};

export type RepoClassification = 'Team' | 'Solo';

export interface CollaborationMetrics {
  // PR 작성 스타일
  prOpenedCount: number | 'N/A';
  prMergedCount: number | 'N/A';
  prSizeLinesMedian: number | 'N/A';
  prSizeFilesMedian: number | 'N/A';
  prLeadTimeMedianHours: number | 'N/A';

  // 리뷰 기여도
  reviewedPrCount: number | 'N/A';
  reviewCommentCount: number | 'N/A';

  // 이슈 참여도 (Optional)
  issuesOpenedCount?: number | 'N/A';
  issuesClosedCount?: number | 'N/A';
  issueCommentCount?: number | 'N/A';

  // 보조 배지
  coAuthoredByDetected?: boolean;
}

export interface CollaborationRepoAnalysis {
  repoName: string;
  classification: RepoClassification;
  metrics: CollaborationMetrics;
}

export interface CollaborationData {
  totalTeamRepos: number;
  totalSoloRepos: number;
  repoAnalyses: CollaborationRepoAnalysis[];
}
