# Collaboration Style (MVP Only) — GitHub 기반

목표: “협업 능력 판정”이 아니라, GitHub에서 **관찰 가능한 협업 흔적**을 카드 형태로 요약한다.  
원칙: 데이터가 없으면 **0점이 아니라 N/A**로 처리한다. (특히 개인 프로젝트)

---

## 0) 적용 범위(필수)
- 분석 기간: 최근 90일
- 우선 대상: Pinned 6개 레포
- 레포 타입 분류:
  - **Team**: 최근 90일 유니크 기여자(작성자) ≥ 2 (또는 PR 작성자 2명 이상)
  - **Solo**: 그 외
- 협업 스타일 지표는 **Team 레포에서만** 기본 제공 (Solo는 N/A가 정상)

---

## 1) PR 작성 스타일 (MVP 핵심)
> Team 레포에서만 집계, PR이 없으면 N/A

### 지표
- `prOpenedCount` : 기간 내 생성 PR 수
- `prMergedCount` : 기간 내 머지 PR 수
- `prSizeLinesMedian` : (additions + deletions) 중앙값
- `prSizeFilesMedian` : changedFiles 중앙값
- `prLeadTimeMedianHours` : createdAt → mergedAt(없으면 closedAt) 중앙값

### 출력(카드 예시 문장)
- “PR 단위로 작업을 묶는 편 / 데이터 부족(N/A)”
- “PR 크기(중앙값): 라인 X / 파일 Y”
- “PR 리드타임(중앙값): Z시간”

---

## 2) 리뷰 기여도 (MVP 유지: ‘존재/총량’만)
> Team 레포에서만 의미가 큼, 개인 프로젝트는 N/A 가능

### 지표
- `reviewedPrCount` : 내가 리뷰(또는 리뷰 코멘트) 참여한 PR 수
- `reviewCommentCount` : 리뷰 코멘트 총량(또는 reviewThreads/comment 총량)

### 출력(카드 예시 문장)
- “리뷰 참여 흔적 있음: PR N건 / 코멘트 M개”
- “리뷰 데이터 부족(N/A)”

> 제외(보류): 승인 비율, 리뷰까지 걸린 시간(정의/왜곡 리스크 큼)

---

## 3) 이슈 참여도 (MVP 옵션: 있으면 플러스)
> 레포마다 이슈를 안 쓰는 문화가 있어 ‘없음=나쁨’으로 해석 금지

### 지표
- `issuesOpenedCount`
- `issuesClosedCount`
- `issueCommentCount`

### 출력(카드 예시 문장)
- “이슈 기반 기록/논의 흔적: 오픈 N / 종료 M / 댓글 K”
- “이슈 사용 흔적 적음(N/A 또는 낮음)”

> 제외(보류): 응답 시간(알림/시간대 영향으로 신뢰 낮음)

---

## 4) 보조 배지(선택)
### 지표
- `coAuthoredByDetected` : 커밋 메시지에 `Co-authored-by:` 존재 여부

### 출력
- “Co-authored-by 흔적 발견” (배지/아이콘 수준)

---

## 5) MVP 출력 원칙(필수)
- **판정 금지:** “협업 가능/불가능” 같은 결론을 내지 않는다.
- **N/A 규칙:** PR/리뷰/이슈 데이터가 없으면 0점 처리 금지 → N/A 표기
- **중앙값 우선:** 평균보다 중앙값(lead time, PR size)을 우선 사용(극단값 왜곡 방지)
- **표본 표시:** 각 카드에 표본 수(예: PR 개수, 리뷰 참여 건수)를 함께 출력

---
