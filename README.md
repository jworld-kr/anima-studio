# 마케팅 자동화 툴

내부용 마케팅 자동화 플랫폼. 캐릭터 페르소나 기반으로 멀티채널 콘텐츠를 자동 생성.

## 기능

### 1. 채널 관리
- 채널 생성/편집/삭제
- 채널별 활성 카테고리 선택 (현재는 Thread만)

### 2. 세계관 설정
- 페르소나 정의 (기본정보, 성격, 배경)
- 콘텐츠 방향 설정
- 톤 조정 (4가지 슬라이더)
- 예시 게시물 추가
- 실시간 시스템 프롬프트 미리보기

### 3. Thread 콘텐츠 생성
- 주제 입력 → AI가 훅 3개 생성
- 훅 선택 → 게시물 생성 (3/5/7개)
- 개별 게시물 인라인 편집
- localStorage에 임시저장

### 4. 콘텐츠 히스토리
- 생성된 콘텐츠 조회
- 상태별 필터 (임시저장/예약/발행)
- 편집/삭제 기능

## 시작하기

### 설치
```bash
npm install
```

### 환경 설정
`.env.local` 파일 생성 후 Claude API 키 설정:
```env
ANTHROPIC_API_KEY=sk-ant-...
```

### 개발 서버 실행
```bash
npm run dev
```

`http://localhost:3000`에서 접속 가능.

### 로그인
테스트용으로 아무 이메일/비밀번호나 입력하면 로그인됨.

## 기술 스택

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **AI**: Claude API (Opus 4.6)
- **Storage**: localStorage (prototype → Supabase)
- **Deployment**: Vercel

## 프로젝트 구조

```
app/
├── api/thread/
│   ├── hooks/route.ts
│   └── posts/route.ts
├── components/
├── lib/
├── types/
├── channels/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/
│       ├── worldbuilding/page.tsx
│       ├── history/page.tsx
│       └── thread/create/page.tsx
├── login/page.tsx
└── page.tsx
```

## 다음 단계

1. Threads API 발행 연동
2. 콘텐츠 편집 페이지
3. Supabase 마이그레이션
4. Shorts/Instagram/Naver Blog 추가
5. 발행 예약 기능
