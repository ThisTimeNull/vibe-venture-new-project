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

### 4. 개발 전용 Mock 시나리오 확인
이 프로젝트는 **Mock Data Provider 패턴**을 사용합니다.

- 개발 모드(`NODE_ENV=development`)에서는 기본적으로 로컬 목업 데이터 Provider가 활성화됩니다.
- 운영 모드에서는 자동으로 Supabase Provider만 사용하므로 목업 데이터가 노출되지 않습니다.

시나리오 전환:
- 홈 화면 상단의 시나리오 칩 클릭
- 또는 쿼리 파라미터 직접 지정: `?mockScenario=...`

지원 시나리오:
- `baseline` (기본)
- `empty-feed` (빈 피드)
- `hot-burst` (Hot 지표 폭증)
- `trend-spike` (Trend 급상승)

예시 URL:
```text
http://localhost:3000/?mockScenario=baseline
http://localhost:3000/?mockScenario=empty-feed
http://localhost:3000/?mockScenario=hot-burst
http://localhost:3000/?mockScenario=trend-spike
```

Mock 모드 비활성화(개발 중 실데이터 확인):
```bash
BLOG_MOCK_MODE=off npm run dev
```

## 폴더 구조
- `src/app` — 라우트별 페이지 (App Router)
- `src/lib/supabase` — Supabase 클라이언트(브라우저/서버/미들웨어), DB 타입
- `src/lib/actions` — 서버 액션 (글 CRUD, 좋아요/댓글/팔로우, 인증)
- `src/lib/mock` — 개발 전용 Mock Provider, 시나리오/URL 유틸
- `src/components` — 공용 UI 컴포넌트
- `supabase/schema.sql` — DB 스키마 (테이블, RLS, 트리거, trend 뷰)

## Hot / Trend 기준
- **Hot**: 좋아요 수 → 조회수 순으로 정렬
- **Trend**: `post_views` 이벤트 로그를 기반으로 최근 5일 이내 조회수가 많은 글 순 (`trending_posts` 뷰 사용)

## 배포
이 저장소는 **Azure App Service + Terraform** 배포를 지원합니다.

> 본 프로젝트에서는 구독 ID `21077d85-2c34-4044-b654-bf12a61fc860`만 사용합니다.

### Terraform으로 인프라 생성
```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars`에서 `supabase_url`, `supabase_anon_key`, `web_app_name`, `site_url`을 실제 값으로 수정한 뒤:

```bash
az account set --subscription 21077d85-2c34-4044-b654-bf12a61fc860
terraform init
terraform validate
terraform plan
terraform apply -auto-approve
```

### 앱 코드 수동 배포(zip deploy)
프로젝트 루트에서:

```bash
./scripts/deploy-appservice.sh rg-vibe-venture-dev-krc app-vibe-venture-krsy0411-dev
```

스크립트는 로컬에서 `npm ci`, `npm run build`를 수행해 Next.js standalone 아티팩트를 만든 뒤 App Service에 업로드합니다.

### 배포 후 Supabase 설정
- Supabase Auth > URL Configuration에서
  - Site URL: `https://<web_app_name>.azurewebsites.net`
  - Redirect URL: `https://<web_app_name>.azurewebsites.net/auth/callback`
  를 추가합니다.

## GitHub CI(자동 품질 검증)
소스를 GitHub에 push하거나 PR을 올리면 `.github/workflows/ci.yml`이 자동 실행되어 아래를 검증합니다.
- `npm ci`
- `npm run lint`
- `npm run test --if-present` (테스트 스크립트가 있을 때만 실행)
- `npm run build`
