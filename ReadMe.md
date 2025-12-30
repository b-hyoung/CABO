# 📦 CABO : The Code Verifier

> **"Resume Lies, Code Doesn't."**
> **화려한 자소서 뒤에 숨겨진 진짜 개발 실력을 AI가 검증합니다.**

![Project Status](https://img.shields.io/badge/Status-Prototype-orange) ![License](https://img.shields.io/badge/License-MIT-blue) ![Stack](https://img.shields.io/badge/Tech-Next.js%20%7C%20Python%20%7C%20AI-000000)

<br>

## 🚩 Problem: 슈뢰딩거의 팀원 (Schrödinger's Teammate)

사이드 프로젝트, 스터디, 해커톤 팀원을 모을 때 우리는 항상 **'관측'하기 전까지는 알 수 없는 불확실성**에 시달립니다.

* **"저 리액트 좀 해요"** (Hello World만 찍어봄)
* **"열정 있습니다!"** (3일 뒤 연락 두절)
* **"소통 원활합니다"** (코드 리뷰 달면 싸우자고 덤빔)

자소서는 소설을 쓸 수 있지만, **커밋 로그(Commit Log)와 코드(Code)는 거짓말을 하지 않습니다.**
하지만 남의 깃허브 코드를 일일이 다 뜯어볼 시간이 부족한 것이 문제입니다.

<br>

## 💡 Solution: 데이터 기반 개발자 전투력 측정기

**CABO(까보)**는 GitHub URL 하나만 입력하면, AI가 해당 개발자의 **성실성, 코드 품질, 협업 스타일**을 분석하여 **'객관적인 개발자 리포트'**를 제공합니다.
"까보지 않고는 모르는" 개발자의 실체를 투명하게 공개합니다.

### 1. 📉 잠수함 탐지 (Ghost Detector)
- 단순히 잔디(Contribution) 개수만 세지 않습니다.
- 커밋 주기와 시간대를 분석하여 **"꾸준한 마라토너"**인지, **"벼락치기 후 잠수 타는 빌런"**인지 판별합니다.
- *Insight:* 프로젝트 중도 이탈 확률을 예측합니다.

### 2. 🧹 코드 청결도 분석 (Code Quality Check)
- 최근 리포지토리의 코드를 AI가 정밀 분석합니다.
- 변수 작명 센스(Naming), 주석 습관, 함수 분리 정도를 파악해 **'유지보수 점수'**를 매깁니다.
- *Insight:* 협업 시 내 코드가 더러워질지 아닐지를 판단합니다.

### 3. 🗣️ 협업 매너 분석 (Communication Style)
- PR(Pull Request)과 Issue에 남긴 코멘트의 뉘앙스를 분석합니다.
- 공격적인 언어 사용 여부, 피드백 수용 태도 등을 분석해 **'팀워크 점수'**를 산출합니다.
- *Insight:* 트러블 메이커인지, 분위기 메이커인지 파악합니다.

### 4. 🪪 개발자 티어 카드 (Dev Tier Card)
- 위 분석 결과를 종합하여 게임 스탯처럼 보여주는 **프로필 카드**를 생성합니다.
- 복잡한 수치 대신, 직관적인 등급으로 실력을 증명하세요.

| Tier | Rank | 설명 |
|:---:|:---:|:---|
| **Challenger** | 💎 | **[상위 1%]** 압도적인 퍼포먼스와 리더십을 가진 아키텍트 |
| **Master** | 🟣 | **[고수]** 어떤 문제를 던져줘도 해결해내는 해결사 |
| **Expert** | 🔵 | **[중수]** 1인분은 거뜬히 해내는 든든한 팀원 |
| **Rookie** | 🟢 | **[초보]** 성장 가능성이 보이지만 가이드가 필요한 단계 |

<br>

## 🛠 Tech Stack

이 프로젝트는 **Web + AI** 기술을 결합하여 구현되었습니다.

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS (미니멀하고 직관적인 UI)
- **Animation:** Framer Motion (티어 카드 인터랙션)

### Backend & AI
- **Server:** Python (FastAPI)
- **Data:** GitHub REST API
- **AI Engine:** LangChain + OpenAI GPT-4o
    - *Prompt Engineering:* 코드 패턴 분석 및 성향 요약 (Persona: 냉철한 코드 리뷰어)

<br>

## 🚀 Roadmap

우리는 단순한 검증을 넘어, 신뢰할 수 있는 팀 빌딩 문화를 만듭니다.

- [x] **Phase 1 (MVP):** GitHub URL 분석 및 리포트 생성 기능
- [ ] **Phase 2:** 사용자 랭킹 시스템 및 티어(Tier) 카드 공유 기능
- [ ] **Phase 3:** 성향이 맞는 개발자 자동 매칭 (MBTI 기반 팀 빌딩)
- [ ] **Phase 4:** 프로젝트 보증금(Escrow) 시스템 연동 (먹튀 방지)

## 🚀 Growth Strategy & Roadmap

CABO는 **"재미(Fun)로 시작해 신뢰(Trust)로 완성되는"** 성장 전략을 가지고 있습니다.
단순한 토이 프로젝트를 넘어, 지속 가능한 개발자 생태계를 만들기 위한 로드맵입니다.

### Phase 1: Viral & Data (현재 단계)
**"내 코드는 몇 티어일까?" - 호기심 자극과 트래픽 확보**
- [x] **MVP:** GitHub URL 분석 및 기본 리포트 제공
- [ ] **Social Share:** 인스타그램/트위터 맞춤형 '개발자 티어 카드' 이미지 생성
- [ ] **Rank System:** 실시간 '이번 주 커밋 왕', '언어별 랭킹' 보드 오픈
> *Goal: 개발자 커밋(Commit) 문화를 게임처럼 즐겁게 만들어 바이럴을 유도합니다.*

### Phase 2: Micro-Transaction & Deep Dive
**"왜 내 점수가 낮지?" - 구체적인 피드백과 소액 결제 모델 도입**
- [ ] **Pro Report (BM):** "변수명 습관", "주석 비율", "중복 코드" 등 AI 상세 지적 리포트 (건당 ￦1,500)
- [ ] **Custom Skins (BM):** 리드미(README.md)에 부착 가능한 다양한 디자인의 티어 배지 판매
- [ ] **Feedback Loop:** 사용자가 AI 분석 결과에 대해 피드백(좋아요/싫어요)을 주며 정확도 고도화
> *Goal: 서버 비용을 충당하고, 데이터의 정밀도를 높여 사용자 신뢰를 쌓습니다.*

### Phase 3: Platform & Ecosystem
**"검증된 사람과 함께하자" - 팀 빌딩과 매칭**
- [ ] **Team Matching:** 성향 분석 데이터를 기반으로 서로 부족한 점을 채워줄 팀원 추천
- [ ] **Study Pot:** 스터디/프로젝트 진행 시 소액의 보증금(Escrow) 기능 연동 (중도 포기 방지)
- [ ] **Open API:** 외부 채용 플랫폼이나 커뮤니티에서 CABO 점수를 조회할 수 있는 API 제공
> *Goal: 축적된 데이터 신뢰도를 바탕으로, 실패 없는 팀 빌딩 문화를 정착시킵니다.*

<br>

## 💸 Sustainability (BM)

우리는 사용자의 데이터를 판매하지 않습니다. 대신, **사용자의 성장을 돕는 도구**를 판매하여 프로젝트를 지속합니다.

| Model | Description | Price |
|:---:|:---|:---:|
| **Basic (Free)** | 기본 분석, 티어 확인, SNS 공유 | **₩0** |
| **Deep Dive** | AI 코드 리뷰, 상세 문제점 진단, 개선 가이드 | **₩1,500 / 회** |
| **Badge Skin** | GitHub 프로필용 프리미엄 배지 스킨 | **₩900 ~** |
