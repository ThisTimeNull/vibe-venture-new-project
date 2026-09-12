# Log — velog 스타일 블로그 서비스

Next.js(App Router) + Supabase(Postgres, Auth) 기반의 블로그 플랫폼입니다.

## 주요 기능
- 이메일/비밀번호 로그인 및 회원가입 (Supabase Auth)
- 메인 피드: 최신 / 🔥 Hot(좋아요·조회수) / 📈 Trend(최근 5일 조회수 급상승)
- 마크다운 에디터로 글 작성·수정·삭제
- 마이페이지: 내가 작성한 글, 글 수·조회수·좋아요·팔로워/팔로잉 통계
- 댓글, 좋아요, 팔로우 등 기본 소셜 기능
- 사용자 프로필 페이지 (`/users/[username]`)

## 시작하기

### 1. Supabase 프로젝트 생성
1. https://supabase.com 에서 새 프로젝트를 생성합니다.
2. `supabase/schema.sql` 파일 내용을 Supabase 대시보드의 **SQL Editor**에 붙여넣고 실행합니다. (테이블, RLS 정책, 트리거, trend용 뷰가 모두 생성됩니다.)
3. **Project Settings > API** 에서 `Project URL`과 `anon public key`를 확인합니다.
4. (선택) **Authentication > Sign In / Providers > Email**에서 `Confirm email`을 꺼두면 회원가입과 동시에 로그인되어 로컬 개발이 더 편합니다. 켜두면 가입 시 인증 메일을 확인해야 로그인할 수 있습니다.
5. **Authentication > URL Configuration**에서 `Site URL`을 `http://localhost:3000`으로, `Redirect URLs`에 `http://localhost:3000/auth/callback`을 추가합니다. (이메일 인증 링크 리다이렉트용)

### 2. 환경 변수 설정
```bash
cp .env.local.example .env.local
```
`.env.local`을 열어 Supabase URL/anon key를 입력합니다.

### 3. 개발 서버 실행
```bash
npm install
npm run dev
```
http://localhost:3000 에서 확인할 수 있습니다.

## 폴더 구조
- `src/app` — 라우트별 페이지 (App Router)
- `src/lib/supabase` — Supabase 클라이언트(브라우저/서버/미들웨어), DB 타입
- `src/lib/actions` — 서버 액션 (글 CRUD, 좋아요/댓글/팔로우, 인증)
- `src/components` — 공용 UI 컴포넌트
- `supabase/schema.sql` — DB 스키마 (테이블, RLS, 트리거, trend 뷰)

## Hot / Trend 기준
- **Hot**: 좋아요 수 → 조회수 순으로 정렬
- **Trend**: `post_views` 이벤트 로그를 기반으로 최근 5일 이내 조회수가 많은 글 순 (`trending_posts` 뷰 사용)

## 배포
현재는 로컬 개발까지만 구성되어 있습니다. 추후 Vercel 등에 배포할 때는 동일한 환경 변수를 배포 환경에 설정하고, Supabase Auth의 Site URL / Redirect URLs에 배포 도메인을 추가하면 됩니다.

## GitHub CI(자동 품질 검증)
소스를 GitHub에 push하거나 PR을 올리면 `.github/workflows/ci.yml`이 자동 실행되어 아래를 검증합니다.
- `npm ci`
- `npm run lint`
- `npm run test --if-present` (테스트 스크립트가 있을 때만 실행)
- `npm run build`

## GitHub CD(메인 머지 후 자동 배포)
`.github/workflows/cd.yml`은 **CI 워크플로가 성공으로 끝난 뒤**, 그리고 대상 브랜치가 **main**일 때만 실행됩니다.

즉, PR을 main에 머지하면:
1. main 기준 CI 실행
2. CI 성공 시 CD 실행
3. Vercel 프로덕션 배포

### GitHub Secrets 설정 (Repository → Settings → Secrets and variables → Actions)
- `VERCEL_TOKEN` : Vercel Personal Token
- `VERCEL_ORG_ID` : Vercel Team/Org ID
- `VERCEL_PROJECT_ID` : Vercel Project ID

위 3개가 설정되어야 CD가 정상 동작합니다.
