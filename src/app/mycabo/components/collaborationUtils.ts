import { CollaborationMetrics } from '@/app/types';

export const getPrStyleProfile = (metrics: CollaborationMetrics) => {
    const { prOpenedCount, prMergedCount, prSizeLinesMedian, prLeadTimeMedianHours } = metrics;

    // Default profile
    const profile = {
        persona: "정보 부족",
        summary: "PR 분석에 필요한 데이터가 충분하지 않습니다.",
        sizeRating: { text: 'N/A', color: 'text-zinc-500' },
        speedRating: { text: 'N/A', color: 'text-zinc-500' },
        mergeRate: { rate: 'N/A' as string | number, color: 'text-zinc-500' },
    };

    if (prOpenedCount === 'N/A' || prOpenedCount < 5) return profile;

    // 1. Merge Rate
    const mergeRateValue = prMergedCount !== 'N/A' && prOpenedCount > 0 
        ? Math.round((prMergedCount / prOpenedCount) * 100) 
        : 'N/A';
    
    if (mergeRateValue !== 'N/A') {
        profile.mergeRate.rate = `${mergeRateValue}%`;
        if (mergeRateValue >= 90) profile.mergeRate.color = 'text-green-500';
        else if (mergeRateValue >= 70) profile.mergeRate.color = 'text-blue-500';
        else profile.mergeRate.color = 'text-yellow-500';
    }

    // 2. PR Size
    if (prSizeLinesMedian !== 'N/A') {
        if (prSizeLinesMedian <= 100) {
            profile.sizeRating = { text: '간결함', color: 'text-green-500' };
        } else if (prSizeLinesMedian <= 400) {
            profile.sizeRating = { text: '표준', color: 'text-blue-500' };
        } else {
            profile.sizeRating = { text: '대규모', color: 'text-yellow-500' };
        }
    }

    // 3. PR Speed (Lead Time)
    if (prLeadTimeMedianHours !== 'N/A') {
        if (prLeadTimeMedianHours <= 8) {
            profile.speedRating = { text: '신속함', color: 'text-green-500' };
        } else if (prLeadTimeMedianHours <= 24) {
            profile.speedRating = { text: '표준', color: 'text-blue-500' };
        } else if (prLeadTimeMedianHours <= 72) {
            profile.speedRating = { text: '여유로움', color: 'text-yellow-500' };
        } else {
            profile.speedRating = { text: '지연됨', color: 'text-red-500' };
        }
    }

    // 4. Determine Persona
    if (profile.sizeRating.text === '간결함' && profile.speedRating.text === '신속함' && mergeRateValue !== 'N/A' && mergeRateValue >= 70) {
        profile.persona = '애자일 기여자';
        profile.summary = '신속하고 작은 단위로 꾸준히 기여하는 스타일입니다.';
    } else if (profile.sizeRating.text === '대규모') {
        profile.persona = '피쳐 개발자';
        profile.summary = '한 번에 크고 중요한 피쳐를 중심으로 작업하는 스타일입니다.';
    } else if (profile.speedRating.text === '신속함') {
        profile.persona = '빠른 해결사';
        profile.summary = '빠른 속도로 PR을 처리하는 데 강점이 있습니다.';
    } else {
        profile.persona = '꾸준한 기여자';
        profile.summary = '자신만의 속도로 꾸준히 프로젝트에 기여합니다.';
    }

    return profile;
};
