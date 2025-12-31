# 🗺️ Technical Architecture & Evolution Roadmap

이 문서는 **FactCheck.dev**의 현재 기술적 선택의 이유와, 향후 서비스 확장에 따른 아키텍처 진화 전략을 기술합니다.
우리의 핵심 개발 철학은 **"Start Lean, Scale Deep(가볍게 시작하여 깊게 확장한다)"**입니다.

---

## 📅 Phase 1: MVP & Market Validation (Current)
> **목표:** "시장이 원하는가?"를 가장 빠르고 저렴하게 검증 (PMF 확인)

초기 단계에서는 오버엔지니어링을 배제하고 **개발 속도(Time-to-Market)**와 **사용자 경험(UX)**에 집중합니다. 별도의 백엔드 인프라 구축 없이 Next.js 생태계를 100% 활용합니다.

### 🛠 Tech Stack
- **Framework:** Next.js 14 (App Router) - Fullstack (Frontend + API Routes)
- **AI Model:** OpenAI GPT-4o (via API)
- **Deployment:** Vercel (Serverless)

### 💡 Why this stack?
1.  **속도:** Python 백엔드/DB 구축 시간을 절약하여 핵심 로직(프롬프트 엔지니어링)에 집중합니다.
2.  **검증:** 사용자가 없으면 확장성도 의미가 없습니다. Vercel AI SDK를 활용해 즉각적인 Streaming 응답을 구현, "빠른 분석" 경험을 제공하는 데 주력합니다.
3.  **비용:** 트래픽이 적은 초기에는 서버를 24시간 띄우는 것보다 Serverless(호출당 과금)가 경제적입니다.

---

## 📅 Phase 2: Data Accumulation & Hybrid Transition
> **목표:** 데이터 자산화 및 비용 효율화 준비

사용자가 모이기 시작하면 동일한 GitHub 프로필을 중복 분석하는 비용이 발생합니다. 이를 방지하고 향후 AI 학습을 위한 데이터를 축적하기 위해 DB를 도입합니다.

### 🛠 Tech Stack Changes
- **Database:** PostgreSQL (Supabase or Neon) 도입.
- **Caching:** Redis (분석 결과 캐싱).

### 🚀 Key Actions
1.  **Caching Strategy:** 한 번 분석한 개발자 리포트는 DB에 저장하여, 재요청 시 API 비용을 0원으로 만듭니다.
2.  **Dataset Building:** AI가 분석한 "코드 품질 평가 데이터"와 실제 "사용자 피드백(평가 정확도)"을 매핑하여 저장합니다. 이 데이터는 Phase 3의 **Fine-tuning 재료**가 됩니다.

---

## 📅 Phase 3: Sovereign AI & Local LLM (The Big Picture)
> **목표:** AI 의존성 탈피, 비용 절감, 도메인 특화 성능 극대화

GPT-4는 범용 모델이므로 비싸고 불필요하게 무겁습니다. 우리가 축적한 데이터를 바탕으로 **"코드 분석에 특화된 소형 모델(sLLM)"**을 직접 운용하여 비용을 1/10로 줄이고 정확도는 높입니다.

### 🛠 Tech Stack Evolution
- **Model Server:** Python (FastAPI + vLLM/Ollama) 별도 구축.
- **AI Model:** Llama 3 or Mistral (Open Source LLM).
- **Training:** LoRA (Low-Rank Adaptation) Fine-tuning.

### 🧠 The "Brain" Upgrade Plan
1.  **Fine-tuning (교육):** Phase 2에서 모은 [GitHub 코드 - AI 분석 리포트] 데이터셋을 활용해 오픈소스 모델을 재학습시킵니다.
    - *효과:* "이 코드는 스파게티 코드다"라고 판단하는 능력이 범용 GPT보다 뛰어난 **전용 모델** 탄생.
2.  **On-Premise / Private Cloud:** 보안이 중요한 기업용(B2B) 솔루션 제공 시, 인터넷 연결 없이도 동작하는 로컬 AI 서버를 기업 내부에 구축해 줄 수 있습니다.
3.  **Cost Optimization:** 토큰당 과금되는 API 비용을 제거하고, GPU 인스턴스 비용으로 고정하여 마진율을 획기적으로 개선합니다.

---

## 📊 Summary of Evolution

| Feature | Phase 1 (MVP) | Phase 2 (Growth) | Phase 3 (Scale) |
| :--- | :--- | :--- | :--- |
| **Backend** | Next.js Only | Next.js + DB | Next.js (BFF) + Python (AI Server) |
| **AI Engine** | OpenAI API | OpenAI + Caching | **Custom Fine-tuned Local LLM** |
| **Cost Model** | Pay-per-Token | Optimization | Fixed GPU Cost |
| **Focus** | Speed & UX | Data Asset | Independence & Margin |

---