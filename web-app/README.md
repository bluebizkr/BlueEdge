# 웹 애플리케이션

이 디렉토리에는 PLC 모니터링 시스템의 웹 애플리케이션 구성 요소가 포함되어 있습니다. Svelte 기반 프런트엔드와 Express.js 백엔드로 구성됩니다.

## 개요

웹 애플리케이션은 PLC 데이터를 모니터링하기 위한 실시간 대시보드를 제공합니다.

*   **프런트엔드 (Svelte):** PLC 데이터를 표시하는 단일 페이지 애플리케이션입니다. 백엔드에서 초기 구성(PLC 주소 맵)을 가져오고 WebSocket을 통해 실시간 업데이트를 수신합니다.
*   **백엔드 (Express.js):** Svelte 프런트엔드를 제공하고, PLC 주소 맵을 위한 API 엔드포인트를 제공하며, 실시간 데이터를 프런트엔드로 푸시하기 위한 WebSocket 서버를 호스팅합니다.

## 시작하기

### 전제 조건

*   Node.js (v18 이상 권장)
*   npm

### 설치

1.  `web-app` 디렉토리로 이동합니다:
    ```bash
    cd web-app
    ```
2.  백엔드 의존성을 설치합니다:
    ```bash
    npm install
    ```
3.  프런트엔드 의존성을 설치합니다:
    ```bash
    npm install --prefix frontend
    ```

### 개발

개발 모드에서 웹 애플리케이션을 실행하려면 (프런트엔드 라이브 리로딩 포함):

1.  `web-app` 디렉토리에 있는지 확인합니다.
2.  개발 서버를 시작합니다:
    ```bash
    npm run dev
    ```
    Express 백엔드는 `http://localhost:3000`에서, WebSocket 서버는 `ws://localhost:3001`에서 수신 대기합니다. Svelte 프런트엔드는 자체 개발 서버에서 제공되며, 일반적으로 `http://localhost:8080` (또는 `sirv-cli` 및 `rollup-plugin-livereload`에 따라 구성된 유사한 주소)을 통해 액세스할 수 있습니다.

### 프로덕션 빌드

프로덕션용 Svelte 프런트엔드를 빌드하려면:

1.  `web-app` 디렉토리에 있는지 확인합니다.
2.  빌드 스크립트를 실행합니다:
    ```bash
    npm run build
    ```
    이렇게 하면 최적화된 `bundle.js` 및 `bundle.css` 파일이 `web-app/frontend/public/build/`에 생성됩니다.

### 프로덕션 백엔드 실행

프런트엔드의 프로덕션 빌드를 제공하는 Express 백엔드를 실행하려면:

1.  프런트엔드가 빌드되었는지 확인합니다 ("프로덕션 빌드" 참조).
2.  `web-app` 디렉토리에 있는지 확인합니다.
3.  Express 서버를 시작합니다:
    ```bash
    npm start
    ```
    서버는 `http://localhost:3000`에서, WebSocket 서버는 `ws://localhost:3001`에서 수신 대기합니다.

## 프로젝트 구조

```
web-app/
├── Dockerfile.dev         # 개발 환경용 Dockerfile
├── Dockerfile.prod        # 프로덕션 환경용 Dockerfile
├── package.json           # 백엔드 의존성 및 스크립트
├── server.js              # Express.js 백엔드 서버
└── frontend/
    ├── package.json       # 프런트엔드 의존성 및 스크립트
    ├── rollup.config.js   # Svelte 빌드용 Rollup 구성
    ├── public/            # 정적 자산 (index.html, global.css, 빌드 출력)
    │   ├── global.css
    │   ├── index.html
    │   └── build/         # 컴파일된 Svelte 자산 (bundle.js, bundle.css)
    └── src/
        ├── App.svelte     # 메인 Svelte 컴포넌트
        └── main.js        # Svelte 애플리케이션 진입점
```