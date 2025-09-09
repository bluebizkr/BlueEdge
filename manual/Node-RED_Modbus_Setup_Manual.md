## Node-RED를 이용한 Modbus 데이터 수집 환경 설정 매뉴얼 (Docker Compose 기반)

이 매뉴얼은 Docker Compose를 사용하여 Node-RED 환경을 설정하고, Modbus 데이터를 수집하는 방법을 안내합니다. 개발 환경과 운영 환경을 분리하고, 구성 파일을 효율적으로 관리하는 방법을 다룹니다.

### 1. 서론

이 문서는 Node-RED를 Docker 컨테이너 환경에서 실행하고, Modbus 통신을 통해 데이터를 수집하는 데 필요한 모든 설정 단계를 제공합니다. 개발 및 운영 환경에 최적화된 Docker Compose 설정을 통해 유연하고 안정적인 시스템 구축을 목표로 합니다.

### 2. 전제 조건

*   **Docker 및 Docker Compose 설치**: 시스템에 Docker Engine과 Docker Compose가 설치되어 있어야 합니다.
*   **기본적인 Docker 및 Node-RED 이해**: Docker 컨테이너 및 Node-RED 플로우 생성에 대한 기본적인 지식이 있으면 좋습니다.
*   **Modbus PLC 주소 맵**: 연결하려는 Modbus PLC의 Modbus 통신 프로토콜 및 주소 맵에 대한 정보가 필요합니다.

### 3. 프로젝트 구조

이 매뉴얼을 통해 다음과 같은 파일 및 디렉토리 구조가 생성됩니다.

```
nodered/
├── config/
│   └── settings.js         # Node-RED 설정 파일
├── data/                   # 개발 환경에서 Node-RED 플로우 및 데이터 저장 (Gitignore 권장)
├── Dockerfile              # 운영 환경용 Node-RED 커스텀 이미지 빌드 파일
├── docker-compose.yml      # 개발 환경용 Docker Compose 설정 파일
└── docker-compose.prod.yml # 운영 환경용 Docker Compose 설정 파일
```

### 4. 개발 환경 설정

개발 환경은 Node-RED 플로우를 쉽게 개발하고 테스트할 수 있도록 설계되었습니다. 플로우 데이터는 호스트 머신에 마운트되어 유지됩니다.

#### 4.1. `docker-compose.yml` 파일

이 파일은 Node-RED 컨테이너를 정의하고, 호스트의 `./data` 디렉토리를 컨테이너의 `/data` 디렉토리에 마운트하여 플로우를 영구적으로 저장합니다. `config/settings.js` 파일도 마운트하여 Node-RED의 기본 설정을 제어합니다.

```yaml
version: '3.8'
services:
  nodered:
    image: nodered/node-red
    container_name: nodered
    ports:
      - "1880:1880"
    volumes:
      - ./data:/data
      - ./config/settings.js:/data/settings.js
    environment:
      - TZ=Asia/Seoul
    restart: unless-stopped
```

#### 4.2. 개발 환경 시작 및 중지

1.  **프로젝트 디렉토리로 이동**:
    ```bash
    cd /Users/joo/Workspace/nodered
    ```
2.  **Node-RED 컨테이너 시작**:
    ```bash
    docker-compose up -d
    ```
    이 명령은 Node-RED 이미지를 다운로드하고(아직 없는 경우), `nodered` 컨테이너를 생성하여 백그라운드에서 시작합니다.
3.  **Node-RED 컨테이너 중지**:
    ```bash
    docker-compose down
    ```
    이 명령은 `nodered` 컨테이너를 중지하고 제거합니다. `./data` 디렉토리에 저장된 플로우 데이터는 유지됩니다.

#### 4.3. Node-RED 접속

컨테이너가 실행되면 웹 브라우저에서 `http://localhost:1880/red`로 Node-RED 인터페이스에 접속할 수 있습니다. (`config/settings.js`에서 `httpAdminRoot`를 `/red`로 설정했기 때문입니다.)

#### 4.4. Modbus 팔레트 설치 (개발 환경)

개발 환경에서는 `node-red-contrib-modbus` 팔레트를 Node-RED UI를 통해 수동으로 설치할 수 있습니다.

1.  Node-RED 인터페이스(`http://localhost:1880/red`)에 접속합니다.
2.  오른쪽 상단 메뉴 아이콘(가로줄 3개)을 클릭합니다.
3.  "팔레트 관리"를 선택합니다.
4.  "설치" 탭으로 이동합니다.
5.  `node-red-contrib-modbus`를 검색합니다.
6.  "설치" 버튼을 클릭합니다.

### 5. 운영 환경 설정

운영 환경은 배포의 일관성과 안정성을 위해 설계되었습니다. 필요한 Node-RED 팔레트가 Docker 이미지에 미리 설치되며, 플로우는 이미지에 포함되거나 외부에서 관리됩니다.

#### 5.1. `Dockerfile` 파일

이 `Dockerfile`은 공식 Node-RED 이미지를 기반으로 `node-red-contrib-modbus` 팔레트를 미리 설치합니다.

```dockerfile
FROM nodered/node-red

# Install node-red-contrib-modbus
RUN npm install node-red-contrib-modbus
```

#### 5.2. `docker-compose.prod.yml` 파일

이 파일은 `Dockerfile`을 사용하여 사용자 정의 Node-RED 이미지를 빌드하고, 운영 환경에 적합한 설정을 적용합니다. 플로우 데이터는 기본적으로 호스트에 마운트되지 않습니다.

```yaml
version: '3.8'
services:
  nodered:
    build: .
    container_name: nodered_prod
    ports:
      - "1880:1880"
    volumes:
      - ./config/settings.js:/data/settings.js
    environment:
      - TZ=Asia/Seoul
      # Add any production-specific environment variables here
    restart: always

# If you decide to use a named volume for persistent data (e.g., context storage), uncomment this:
# volumes:
#   nodered_data:
```

#### 5.3. 운영 환경 시작 및 중지

1.  **프로젝트 디렉토리로 이동**:
    ```bash
    cd /Users/joo/Workspace/nodered
    ```
2.  **사용자 정의 Node-RED 이미지 빌드**:
    ```bash
    docker-compose -f docker-compose.prod.yml build
    ```
    이 명령은 `Dockerfile`을 사용하여 `node-red-contrib-modbus` 팔레트가 포함된 Docker 이미지를 빌드합니다.
3.  **Node-RED 컨테이너 시작**:
    ```bash
    docker-compose -f docker-compose.prod.yml up -d
    ```
    이 명령은 사용자 정의 빌드된 이미지를 사용하여 `nodered_prod` 컨테이너를 백그라운드에서 시작합니다.
4.  **Node-RED 컨테이너 중지**:
    ```bash
    docker-compose -f docker-compose.prod.yml down
    ```

#### 5.4. 운영 환경에서의 플로우 관리 고려 사항

운영 환경에서는 플로우를 배포 프로세스의 일부로 관리하는 것이 중요합니다.

*   **이미지에 플로우 포함**: 가장 간단한 방법은 `Dockerfile`에 `flows.json` 및 `flows_cred.json` 파일을 복사하여 이미지에 포함시키는 것입니다.
    ```dockerfile
    FROM nodered/node-red

    # Install node-red-contrib-modbus
    RUN npm install node-red-contrib-modbus

    # Copy flows into the image (assuming flows.json and flows_cred.json are in the project root)
    COPY flows.json /data/flows.json
    COPY flows_cred.json /data/flows_cred.json
    ```
*   **외부 저장소 사용**: 더 견고한 솔루션은 Node-RED가 플로우를 데이터베이스(예: MongoDB, PostgreSQL) 또는 공유 파일 시스템에 저장하도록 구성하는 것입니다. 이는 `settings.js` 파일에서 설정할 수 있습니다.

### 6. 구성 분리 (`config/settings.js`)

`config/settings.js` 파일은 Node-RED의 핵심 설정을 중앙에서 관리하는 역할을 합니다.

#### 6.1. `config/settings.js` 파일

```javascript
module.exports = {
    // The httpRoot path for the UI
    httpAdminRoot: "/red",

    // The httpRoot path for the static content of the UI
    httpStatic: "/red",

    // The port that the Node-RED UI will listen on
    uiPort: 1880,

    // Disable the editor for production environments if flows are baked into the image
    // disableEditor: false,

    // Credential secret for flows
    // credentialSecret: "a-long-random-string-for-production",

    // To enable project feature
    // projects: {
    //     enabled: true
    // },

    // To enable external modules
    // externalModules: {
    //     palette: {
    //         allowInstall: true,
    //         allowUpload: true
    //     },
    //     npmInstall: {
    //         // If true, Node-RED will attempt to install missing modules on startup
    //         // This should be false in production
    //         autoInstall: true,
    //         // If true, Node-RED will attempt to install missing modules on startup
    //         // This should be false in production
    //         autoInstall: true
    //     }
    // },

    // Other settings can go here
};
```

#### 6.2. 구성 파일 마운트

`docker-compose.yml` 및 `docker-compose.prod.yml` 파일 모두 `volumes: - ./config/settings.js:/data/settings.js` 라인을 통해 호스트의 `config/settings.js` 파일을 컨테이너의 `/data/settings.js` 경로에 마운트합니다. 이는 개발 및 운영 환경 모두에서 일관된 기본 설정을 보장합니다.

#### 6.3. 구성 변경 및 적용

`config/settings.js` 파일을 수정한 후에는 변경 사항을 적용하기 위해 Node-RED 컨테이너를 다시 시작해야 합니다.

*   **개발 환경**:
    ```bash
    docker-compose down
    docker-compose up -d
    ```
*   **운영 환경**:
    ```bash
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    ```
    (`Dockerfile`을 변경한 경우 `docker-compose -f docker-compose.prod.yml build`를 먼저 실행해야 합니다.)

### 7. Node-RED에서 Modbus 데이터 수집

`node-red-contrib-modbus` 팔레트를 사용하여 Modbus PLC에서 Modbus 데이터를 수집할 수 있습니다.

#### 7.1. Modbus TCP Read 노드 설정

1.  **Node-RED 에디터 접속**: `http://localhost:1880/red`
2.  **새 플로우 생성**: 왼쪽 팔레트에서 `modbus` 노드 그룹을 찾습니다.
3.  **`Modbus Read` 노드 추가**: 플로우로 드래그합니다.
4.  **`Modbus Read` 노드 설정**: 노드를 더블 클릭하여 설정 창을 엽니다.
    *   **Server 설정**: "Server" 옆의 연필 아이콘을 클릭하여 새 Modbus Server를 추가합니다.
        *   **Type**: `TCP`
        *   **Host**: Modbus **PLC의 IP 주소**
        *   **Port**: 일반적으로 `502` (PLC 설정 확인)
        *   **Unit-Id**: PLC의 Modbus Unit ID (PLC 설명서 확인)
        *   "Add"를 클릭하여 저장합니다.
    *   **Function**: 읽으려는 데이터 유형 선택 (예: `Holding Registers`)
    *   **Address**: PLC에서 읽으려는 Modbus **시작 주소** (PLC 설명서에서 0-based 또는 1-based 주소 체계 확인)
    *   **Quantity**: 읽으려는 레지스터 또는 코일의 **개수**
    *   **Name**: 노드 이름 지정 (예: "Modbus PLC 데이터 읽기")
5.  **`Debug` 노드 연결**: `Modbus Read` 노드 뒤에 `Debug` 노드를 연결하여 읽어온 데이터를 확인합니다.
6.  **배포**: "Deploy" 버튼을 클릭하여 플로우를 배포합니다.

#### 7.2. Modbus 주소 맵의 중요성

Modbus PLC의 정확한 Modbus 주소 맵(어떤 데이터가 어떤 주소에 저장되어 있는지, 데이터 타입은 무엇인지)을 아는 것이 가장 중요합니다. 이 정보는 PLC의 매뉴얼이나 프로그래밍 소프트웨어에서 확인할 수 있습니다. 잘못된 주소나 데이터 타입을 사용하면 올바른 데이터를 읽을 수 없습니다.

### 8. 문제 해결

*   **"Cannot GET /" 오류**: Node-RED UI에 접속할 때 이 오류가 발생하면, `http://localhost:1880/red`로 접속했는지 확인하세요. `config/settings.js`에서 `httpAdminRoot`가 `/red`로 설정되어 있기 때문입니다.
*   **"Cannot connect to the Docker daemon"**: Docker 데몬이 실행되고 있지 않습니다. Docker Desktop을 시작하거나 Docker 데몬을 실행한 후 다시 시도하세요.
*   **컨테이너가 시작되지 않음**: `docker-compose logs` 명령을 사용하여 컨테이너 로그를 확인하여 오류 메시지를 파악합니다.
*   **Modbus 통신 실패**:
    *   PLC의 IP 주소와 포트가 올바른지 확인합니다.
    *   PLC가 Modbus 통신을 허용하도록 설정되어 있는지 확인합니다.
    *   Modbus 주소, 기능 코드, 수량이 PLC의 Modbus 맵과 일치하는지 확인합니다.
    *   네트워크 방화벽이 Modbus 포트(기본 502)를 차단하고 있지 않은지 확인합니다.
