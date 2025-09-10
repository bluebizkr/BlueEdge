# BlueEdge 시스템 배포 가이드

이 가이드는 Docker Compose를 사용하여 BlueEdge PLC 모니터링 시스템을 배포하는 방법을 설명합니다. 이 시스템은 웹 애플리케이션(Svelte/Express), 데이터 수집을 위한 Node-RED, 그리고 MQTT 브로커인 Mosquitto로 구성됩니다.

## 1. 사전 준비 사항

시작하기 전에 시스템에 다음이 설치되어 있는지 확인하십시오:

*   **Docker**: [Docker Engine 설치](https://docs.docker.com/engine/install/)
*   **Docker Compose**: [Docker Compose 설치](https://docs.docker.com/compose/install/) (일반적으로 Docker Desktop에 포함되어 있습니다)
*   **Git**: [Git 설치](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

## 2. 프로젝트 가져오기

먼저, BlueEdge 프로젝트 저장소를 로컬 머신으로 클론합니다:

```bash
git clone <repository_url> # <repository_url>을 실제 Git 저장소 URL로 바꾸세요.
cd BlueEdge
```

## 3. 시스템 배포

BlueEdge 시스템은 모든 필수 서비스(웹 앱, Node-RED, Mosquitto)를 오케스트레이션하는 Docker Compose를 사용하여 배포되도록 설계되었습니다.

1.  **프로젝트 루트 디렉토리로 이동**:
    `docker-compose.yml` 파일이 있는 `BlueEdge` 디렉토리에 있는지 확인하십시오.

2.  **서비스 시작**:
    다음 명령을 실행하여 모든 서비스를 분리 모드(백그라운드)로 빌드(필요한 경우)하고 시작합니다:

    ```bash
    docker-compose up -d
    ```

    이 명령은 다음을 수행합니다:
    *   `nodered/node-red` 및 `eclipse-mosquitto` 이미지를 Docker Hub에서 가져옵니다.
    *   `human109/blue-edge:latest` (웹 앱) 이미지를 Docker Hub에서 가져옵니다.
    *   `nodered`, `mosquitto`, `web-app` 컨테이너를 생성하고 시작합니다.
    *   필요한 네트워크 및 볼륨을 설정합니다.

3.  **배포 확인**:
    다음 명령으로 실행 중인 컨테이너의 상태를 확인할 수 있습니다:

    ```bash
    docker-compose ps
    ```

## 4. 서비스 접속

컨테이너가 실행되면 BlueEdge 시스템의 다양한 구성 요소에 접속할 수 있습니다:

*   **웹 애플리케이션 (프론트엔드)**:
    웹 브라우저를 열고 다음 주소로 이동하십시오:
    ```
    http://localhost:3000
    ```

*   **Node-RED 인터페이스**:
    웹 브라우저를 열고 다음 주소로 이동하십시오:
    ```
    http://localhost:1880
    ```

## 5. 설정 파일

`plc_address_map_example.json` 및 `settings.js`와 같은 설정 파일은 프로젝트의 `config/` 디렉토리에 있습니다. 이 파일들은 해당 Docker 컨테이너에 볼륨으로 마운트됩니다.

*   호스트 머신(`BlueEdge/config/` 디렉토리)에서 이 파일들을 직접 수정할 수 있습니다.
*   호스트에서 이 파일들을 변경하면 이미지를 다시 빌드할 필요 없이 실행 중인 컨테이너 내부에 반영됩니다.
*   Node-RED의 `settings.js`를 수정하는 경우, 변경 사항을 적용하려면 `nodered` 컨테이너를 다시 시작해야 할 수 있습니다:
    ```bash
    docker-compose restart nodered
    ```

## 6. 시스템 중지

`docker-compose`에 의해 생성된 모든 컨테이너, 네트워크 및 볼륨을 중지하고 제거하려면:

```bash
docker-compose down
```
