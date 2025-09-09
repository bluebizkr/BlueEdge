# Node-RED Modbus 데이터 수집 프로젝트

이 프로젝트는 LS 산전 PLC를 중심으로 한 PLC로부터의 Modbus 데이터 자동 수집을 위한 Docker 기반 Node-RED 환경을 제공합니다.

## 주요 기능

*   **Docker 기반 Node-RED:** 손쉬운 배포가 가능한 개발 및 운영 환경.
*   **자동 플로우 생성:** 구조화된 PLC 주소 맵(`config/plc_address_map_example.json`)을 기반으로 Node-RED 플로우를 동적으로 생성합니다.
*   **Modbus 통합:** `node-red-contrib-modbus`를 활용하여 Modbus TCP/IP 장치와의 원활한 통신을 지원합니다.
*   **설정 가능:** 유연한 배포를 위한 분리된 설정 파일(`config/settings.js`).
*   **테스트 가능:** Node-RED 함수 노드 로직 테스트를 위한 프레임워크를 포함합니다.

## 시작하기

### 전제 조건

*   시스템에 Docker 및 Docker Compose가 설치되어 있어야 합니다.
*   프로젝트 파일에 접근할 수 있어야 합니다.

### 설정

1.  **저장소 복제:**
    ```bash
    git clone <repository_url>
    cd nodered
    ```
2.  **개발 환경:**
    개발 환경을 설정하려면 `docker-compose.yml`을 사용합니다:
    ```bash
    docker-compose up -d
    ```
    Node-RED는 `http://localhost:1880`에서 접근할 수 있습니다.

3.  **운영 환경:**
    운영 환경 설정을 위해서는 사용자 정의 Docker 이미지를 빌드하고 `docker-compose.prod.yml`을 사용합니다:
    ```bash
    docker build -t my-nodered-prod .
    docker-compose -f docker-compose.prod.yml up -d
    ```

### 구성

*   **PLC 주소 맵:** `config/plc_address_map_example.json`을 수정하여 PLC의 Modbus 주소, 데이터 유형 및 스케일링을 정의합니다.
*   **Node-RED 설정:** Admin API 설정을 포함하여 Node-RED 관련 설정을 위해 `config/settings.js`를 조정합니다.

## 사용법

1.  **Node-RED UI 접속:** 웹 브라우저를 열고 `http://localhost:1880` (또는 서버의 IP)으로 이동합니다.
2.  **자동 설정 실행:** `Automated Setup Flow` 탭으로 이동하여 `Run Auto Setup` 인젝트 노드의 버튼을 클릭합니다. 그러면 `plc_address_map_example.json`을 기반으로 Modbus 데이터 수집 플로우가 생성되고 배포됩니다.
3.  **데이터 확인:** Node-RED 디버그 탭을 확인하여 수집된 Modbus 데이터를 확인합니다.

## 매뉴얼 및 가이드

자세한 지침, 문제 해결 및 고급 설정에 대해서는 `manual/` 디렉토리에 있는 다음 매뉴얼을 참조하십시오:

*   `manual/Node-RED_Modbus_Setup_Manual.md`
*   `manual/Node-RED_Palette_Management_Manual.md`
*   `manual/Node-RED_Modbus_Data_Collection_Manual.md`
*   `manual/Node-RED_Automated_Setup_Know-how_Manual.md`
*   `manual/Node-RED_Admin_API_Setup_Manual.md`
*   `manual/Node-RED_Modbus_Minimal_Test_Manual.md`

## 테스트

# Node-RED Modbus 데이터 수집 프로젝트

이 프로젝트는 PLC로부터의 Modbus 데이터 자동 수집을 위한 Docker 기반 Node-RED 환경을 제공합니다.

## 주요 기능

*   **Docker 기반 Node-RED:** 손쉬운 배포가 가능한 개발 및 운영 환경.
*   **자동 플로우 생성:** 구조화된 PLC 주소 맵(`config/plc_address_map_example.json`)을 기반으로 Node-RED 플로우를 동적으로 생성합니다.
*   **Modbus 통합:** `node-red-contrib-modbus`를 활용하여 Modbus TCP/IP 장치와의 원활한 통신을 지원합니다.
*   **설정 가능:** 유연한 배포를 위한 분리된 설정 파일(`config/settings.js`).
*   **테스트 가능:** Node-RED 함수 노드 로직 테스트를 위한 프레임워크를 포함합니다.

## 시작하기

### 전제 조건

*   시스템에 Docker 및 Docker Compose가 설치되어 있어야 합니다.
*   프로젝트 파일에 접근할 수 있어야 합니다.

### 설정

1.  **저장소 복제:**
    ```bash
    git clone <repository_url>
    cd nodered
    ```
2.  **개발 환경:**
    개발 환경을 설정하려면 `docker-compose.yml`을 사용합니다:
    ```bash
    docker-compose up -d
    ```
    Node-RED는 `http://localhost:1880`에서 접근할 수 있습니다.

3.  **운영 환경:**
    운영 환경 설정을 위해서는 사용자 정의 Docker 이미지를 빌드하고 `docker-compose.prod.yml`을 사용합니다:
    ```bash
    docker build -t my-nodered-prod .
    docker-compose -f docker-compose.prod.yml up -d
    ```

### 구성

*   **PLC 주소 맵:** `config/plc_address_map_example.json`을 수정하여 PLC의 Modbus 주소, 데이터 유형 및 스케일링을 정의합니다.
*   **Node-RED 설정:** Admin API 설정을 포함하여 Node-RED 관련 설정을 위해 `config/settings.js`를 조정합니다.

## 사용법

1.  **Node-RED UI 접속:** 웹 브라우저를 열고 `http://localhost:1880` (또는 서버의 IP)으로 이동합니다.
2.  **자동 설정 실행:** `Automated Setup Flow` 탭으로 이동하여 `Run Auto Setup` 인젝트 노드의 버튼을 클릭합니다. 그러면 `plc_address_map_example.json`을 기반으로 Modbus 데이터 수집 플로우가 생성되고 배포됩니다.
3.  **데이터 확인:** Node-RED 디버그 탭을 확인하여 수집된 Modbus 데이터를 확인합니다.

## 매뉴얼 및 가이드

자세한 지침, 문제 해결 및 고급 설정에 대해서는 `manual/` 디렉토리에 있는 다음 매뉴얼을 참조하십시오:

*   `manual/Node-RED_Modbus_Setup_Manual.md`
*   `manual/Node-RED_Palette_Management_Manual.md`
*   `manual/Node-RED_Modbus_Data_Collection_Manual.md`
*   `manual/Node-RED_Automated_Setup_Know-how_Manual.md`
*   `manual/Node-RED_Admin_API_Setup_Manual.md`
*   `manual/Node-RED_Modbus_Minimal_Test_Manual.md`

## 테스트

Node-RED 함수 노드 테스트를 실행하려면, `mocha` 및 `node-red-node-test-helper`가 설치되어 있는지 확인하고 (개발 종속성으로) 다음을 실행합니다:

```bash
./node_modules/mocha/bin/mocha test/flows/modbus_flow_logic.test.js
```
