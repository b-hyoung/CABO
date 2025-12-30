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
