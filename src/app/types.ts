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
    codeQualityScore: number;
    maintainability: string;
    communicationScore: number;
    teamworkStyle: string;
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

export type Tab = 'activity' | 'quality' | 'communication';
