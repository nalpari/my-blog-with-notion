# Supabase Google OAuth 설정 가이드

## 🚨 현재 발생 중인 에러

```
GET https://stcwgfbjyvlyshdvojgn.supabase.co/auth/v1/authorize?provider=google
→ 400 (Bad Request)
```

**원인**: Supabase Dashboard에서 Google Provider가 활성화되지 않았거나 Client ID/Secret이 설정되지 않음

## 📋 즉시 해결 방법

### Step 1: Google Cloud Console 설정

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/ 접속
   - 프로젝트 생성 또는 선택

2. **OAuth 동의 화면 구성**
   - APIs & Services → OAuth consent screen
   - User Type: External 선택
   - 필수 정보 입력:
     - App name: My Blog with Notion
     - User support email: 본인 이메일
     - Developer contact: 본인 이메일
   - Scopes: `email`, `profile` 추가

3. **OAuth 2.0 Client ID 생성**
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: **Web application**
   - Name: Supabase Auth
   - **Authorized redirect URIs** (매우 중요!):
     ```
     https://stcwgfbjyvlyshdvojgn.supabase.co/auth/v1/callback
     ```
   - CREATE 클릭
   - **Client ID**와 **Client Secret** 복사 (잘 보관!)

### Step 2: Supabase Dashboard 설정

1. **Supabase Dashboard 접속**
   ```
   https://supabase.com/dashboard/project/stcwgfbjyvlyshdvojgn/auth/providers
   ```

2. **Google Provider 활성화**
   - Authentication → Providers → Google 찾기
   - **Enable Google** 토글 ON
   - 다음 정보 입력:
     - **Client ID**: Google Cloud Console에서 복사한 값
     - **Client Secret**: Google Cloud Console에서 복사한 값
   - **Save** 클릭

3. **설정 확인**
   - Redirect URL 확인:
     ```
     https://stcwgfbjyvlyshdvojgn.supabase.co/auth/v1/callback
     ```
   - 이 URL이 Google Cloud Console의 Authorized redirect URIs와 정확히 일치해야 함

### Step 3: 로컬 환경 테스트

1. **개발 서버 재시작**
   ```bash
   npm run dev
   ```

2. **브라우저 캐시 클리어**
   - Chrome: Cmd+Shift+Delete (Mac) / Ctrl+Shift+Delete (Windows)
   - 또는 시크릿/프라이빗 창에서 테스트

3. **콘솔 로그 확인**
   - 개발자 도구 열기 (F12)
   - Console 탭에서 로그 확인
   - `Starting OAuth sign-in with google` 메시지 확인

## 🔍 문제 해결 체크리스트

### Supabase Dashboard 확인
- [ ] Google Provider가 **Enabled** 상태인가?
- [ ] Client ID가 올바르게 입력되었는가?
- [ ] Client Secret이 올바르게 입력되었는가?
- [ ] Save 버튼을 클릭했는가?

### Google Cloud Console 확인
- [ ] OAuth 2.0 Client가 생성되었는가?
- [ ] Application Type이 **Web application**인가?
- [ ] Authorized redirect URIs에 Supabase URL이 추가되었는가?
- [ ] OAuth 동의 화면이 구성되었는가?

### 코드 확인
- [ ] 환경변수가 올바른가?
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://stcwgfbjyvlyshdvojgn.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   ```

## 🚀 빠른 테스트 방법

### 1. Supabase Auth 상태 확인
브라우저에서 다음 URL 접속:
```
https://stcwgfbjyvlyshdvojgn.supabase.co/auth/v1/health
```
정상이면 `{"status":"ok"}` 응답

### 2. Provider 목록 확인
브라우저 콘솔에서 실행:
```javascript
const response = await fetch('https://stcwgfbjyvlyshdvojgn.supabase.co/auth/v1/settings');
const data = await response.json();
console.log(data.external_providers);
```
Google이 목록에 있어야 함

## 💡 추가 팁

### Google Cloud Console에서 자주 하는 실수
1. **Authorized redirect URIs 오타**: 정확히 복사/붙여넣기
2. **http vs https**: Production은 반드시 https 사용
3. **trailing slash**: URL 끝에 `/` 없어야 함

### Supabase에서 자주 하는 실수
1. **Save 버튼 클릭 안 함**: 설정 후 반드시 Save
2. **잘못된 Client Secret**: 공백이나 줄바꿈 포함 주의
3. **Provider 비활성화 상태**: Enable 토글 확인

## 📞 도움이 필요하다면

1. **Supabase Status 확인**
   - https://status.supabase.com/

2. **Supabase Discord**
   - https://discord.supabase.com/

3. **로그 확인**
   - Supabase Dashboard → Logs → Auth Logs
   - 에러 메시지와 타임스탬프 확인

## 🎯 예상 소요 시간

| 작업 | 시간 |
|-----|-----|
| Google Cloud Console 설정 | 10분 |
| Supabase Dashboard 설정 | 5분 |
| 테스트 및 확인 | 5분 |
| **총 소요 시간** | **20분** |

## ✅ 성공 확인

Google 로그인 버튼 클릭 시:
1. Google 계정 선택 화면 표시
2. 권한 동의 화면 표시
3. 앱으로 리디렉션
4. 로그인 성공 메시지 또는 사용자 정보 표시