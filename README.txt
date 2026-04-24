홈페이지 로그 적재 패치

넣는 위치
- index.html -> 프로젝트 루트
- index_log.js -> 프로젝트 루트
- api/log-visit.js -> 프로젝트 루트의 api 폴더
- api/visitor-logs.js -> 프로젝트 루트의 api 폴더
- admin/admin_logs.html -> 프로젝트 루트의 admin 폴더

전제
- Vercel 환경변수
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY

테스트
1) 홈페이지 열기
2) 로그인 / 무료체험 / 기존 구독회원 바로가기 버튼 클릭
3) /admin/admin_logs.html 에서 로그 불러오기
