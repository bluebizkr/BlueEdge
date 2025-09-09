# Node-RED Modbus 최소 통신 테스트 절차 매뉴얼 (폐쇄망 환경)

## 서론

이 매뉴얼은 폐쇄망 환경에서 Modbus PLC와 Node-RED 간의 최소한의 Modbus 통신 및 데이터 수집 가능 여부를 테스트하는 절차를 안내합니다. 폐쇄망의 특성을 고려하여, 모든 외부 의존성(Docker 이미지, npm 패키지 등)은 사전에 준비되거나 내부망을 통해 전송되어야 합니다.

## 전제 조건

테스트를 시작하기 전에 다음 전제 조건이 충족되었는지 확인하십시오.

*   **Modbus PLC:** 테스트할 Modbus PLC가 준비되어 있고, IP 주소 및 Modbus 통신 포트(예: 502)가 설정되어 있어야 합니다. PLC의 Modbus 레지스터 맵(주소, 데이터 타입, 엔디안 등)을 숙지하고 있어야 합니다.
*   **PLC 프로그래밍 소프트웨어:** PLC의 통신 설정을 확인하고 필요한 경우 변경할 수 있는 PLC 프로그래밍 소프트웨어(예: XG5000, GX Works2 등)가 준비되어 있어야 합니다.
*   **Node-RED 프로젝트 파일:** 현재 작업 중인 Node-RED 프로젝트 파일(예: `docker-compose.yml`, `Dockerfile`, `config/`, `test/` 디렉토리 등)이 폐쇄망 환경으로 전송되어 있어야 합니다.
*   **Docker 환경:** Node-RED를 실행할 서버에 Docker 및 Docker Compose가 설치되어 있어야 합니다.
*   **Node-RED Docker 이미지:** Node-RED Docker 이미지(예: `nodered/node-red:latest` 또는 사용자 정의 이미지)가 폐쇄망 내부에 미리 다운로드되어 있거나, 외부망에서 다운로드하여 내부망으로 전송할 수 있어야 합니다.
*   **`node-red-contrib-modbus` 팔레트:** 이 팔레트가 Node-RED 이미지에 포함되어 있거나, 폐쇄망 환경에서 수동으로 설치할 수 있는 방법이 준비되어 있어야 합니다.
*   **테스트 종속성 (선택 사항, 로컬 테스트용):** `mocha` 및 `node-red-node-test-helper` 패키지가 로컬 테스트를 위해 필요하다면, 이들도 폐쇄망 환경에서 설치할 수 있는 방법이 준비되어 있어야 합니다.

## 1. 프로젝트 파일 준비

Node-RED 프로젝트 파일 내에서 PLC 통신을 위한 설정을 업데이트합니다.

### 1.1. `config/plc_address_map_example.json` 업데이트

PLC에서 가져올 데이터의 Modbus 주소 정보를 추가합니다. Modbus Holding Register 41000에서 13개의 데이터를 가져오는 예시입니다.

1.  `config/plc_address_map_example.json` 파일을 텍스트 편집기로 엽니다.
2.  다음 JSON 객체를 배열 내에 추가합니다. `dataType`과 `endianness`는 PLC의 실제 설정과 정확히 일치해야 합니다.

    ```json
    [
        // ... 기존 항목들 ...
        {
            "name": "PLC_Data_Example",
            "address": 41000, // Modbus Holding Register 41000에 해당하는 주소
            "quantity": 13,
            "functionCode": "Holding Registers",
            "dataType": "int16", // PLC의 실제 데이터 타입에 맞게 설정 (예: int32, float32, boolean 등)
            "endianness": "big-endian", // PLC의 실제 엔디안에 맞게 설정 (little-endian 또는 big-endian)
            "scaling": {
                "factor": 1,
                "offset": 0
            },
            "unit": ""
        }
    ]
    ```

### 1.2. `auto_modbus_setup_flow.json`의 Modbus 클라이언트 IP 업데이트

자동 생성될 Modbus 클라이언트 노드가 PLC의 올바른 IP 주소로 연결되도록 설정합니다.

1.  `config/flows/auto_modbus_setup_flow.json` 파일을 텍스트 편집기로 엽니다.
2.  파일 내에서 `"id": "generate_flow_json"`을 가진 `function` 노드의 `func` 속성 내용을 찾습니다.
3.  `modbusServerId`를 정의하는 부분에서 `server` 값을 PLC의 실제 IP 주소로 변경합니다. PLC의 Modbus TCP 포트가 502가 아니라면 `port` 값도 변경합니다.

    ```javascript
    // auto_modbus_setup_flow.json 내의 generate_flow_json 함수 노드 내용 중
    nodes.push({
        "id": modbusServerId,
        "type": "modbus-client",
        "name": "Modbus TCP Client",
        "server": "192.168.0.101", // <-- 이 부분을 PLC의 실제 IP 주소로 변경
        "port": "502", // <-- PLC의 Modbus TCP 포트가 502가 아니라면 변경
        "unit_id": "1",
        "tcp_type": "DEFAULT",
        "x": 0,
        "y": 0,
        "wires": [],
        "_users": []
    });
    ```

### 1.3. `config/settings.js`의 Admin API 토큰 임시 설정 (테스트용)

Node-RED Admin API를 통해 플로우를 배포하기 위한 임시 토큰을 설정합니다. **이 설정은 테스트 목적으로만 사용하며, 운영 환경에서는 절대 이렇게 사용해서는 안 됩니다.**

1.  `config/settings.js` 파일을 텍스트 편집기로 엽니다.
2.  `module.exports` 내에 `adminAuth` 섹션을 추가하거나 수정합니다. `YOUR_SECRET_PASSWORD`를 원하는 임시 비밀번호로 변경하고, `node -e "console.log(require('bcryptjs').hashSync('YOUR_SECRET_PASSWORD', 8));"` 명령을 사용하여 해시된 비밀번호를 생성하여 `password` 필드에 붙여넣습니다.

    ```javascript
    // config/settings.js
    module.exports = {
        // ... 다른 설정 ...

        adminAuth: {
            type: "credentials",
            users: [
                {
                    username: "admin", // 테스트용 사용자 이름
                    password: "$2a$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // 해시된 임시 비밀번호
                    permissions: "*", // 모든 권한 부여 (테스트용)
                }
            ]
        },

        // ... 다른 설정 ...
    };
    ```
3.  `auto_modbus_setup_flow.json`의 `Deploy Flow via Admin API` 노드에서 `Authorization` 헤더의 `YOUR_ADMIN_API_TOKEN`을 `settings.js`에 설정한 **일반 텍스트 비밀번호**로 임시로 변경합니다.

    ```json
    {
        "p": "Authorization",
        "v": "Bearer YOUR_SECRET_PASSWORD" // <-- settings.js에 설정한 일반 텍스트 비밀번호
    }
    ```

## 2. Node-RED 환경 준비 (폐쇄망 특정)

폐쇄망 환경에서 Node-RED Docker 컨테이너를 준비하고 실행합니다.

### 2.1. Docker 이미지 전송 (필요시)

Node-RED Docker 이미지가 폐쇄망 내부에 없다면, 외부망에서 다운로드하여 내부망으로 전송해야 합니다.

1.  **외부망에서 이미지 다운로드:**
    ```bash
    docker pull nodered/node-red:latest
    # 또는 사용자 정의 이미지를 빌드한 경우
    # docker build -t my-nodered-image .
    ```
2.  **이미지 저장:**
    ```bash
    docker save -o nodered_image.tar nodered/node-red:latest
    # 또는 사용자 정의 이미지의 경우
    # docker save -o my_nodered_image.tar my-nodered-image
    ```
3.  **이미지 전송:** `nodered_image.tar` 파일을 폐쇄망 서버로 전송합니다 (USB, 내부망 파일 공유 등).
4.  **폐쇄망 서버에서 이미지 로드:**
    ```bash
    docker load -i nodered_image.tar
    ```

### 2.2. Node-RED 컨테이너 실행

프로젝트 루트 디렉토리에서 다음 명령을 사용하여 Node-RED 컨테이너를 실행합니다. `config/` 디렉토리가 컨테이너에 마운트되어 변경 사항이 즉시 반영되도록 합니다.

```bash
# Node-RED 컨테이너 중지 및 제거 (이전에 실행 중이었다면)
docker-compose down

# Node-RED 컨테이너 실행
docker-compose up -d
```

## 3. 네트워크 연결 테스트

Node-RED 컨테이너가 Modbus PLC에 네트워크적으로 접근 가능한지 확인합니다.

1.  **Node-RED 호스트에서 PLC Ping 테스트:**
    Node-RED 컨테이너가 실행 중인 서버의 터미널에서 다음 명령을 실행하여 PLC에 Ping이 가는지 확인합니다.
    ```bash
    ping 192.168.0.101 # <-- Modbus PLC의 실제 IP 주소
    ```
    Ping이 성공하면 네트워크 연결에 문제가 없음을 의미합니다.

2.  **Docker 컨테이너 내부에서 PLC Ping 테스트 (선택 사항):**
    더 확실한 테스트를 위해 Node-RED 컨테이너 내부에서 직접 Ping 테스트를 수행할 수 있습니다.
    ```bash
    # Node-RED 컨테이너 ID 확인
    docker ps
    # 컨테이너 내부에서 Ping 실행
    docker exec -it <node-red-container-id> ping 192.168.0.101
    ```

## 4. 자동화된 설정 플로우 실행

Node-RED UI에 접속하여 Modbus 데이터 수집 플로우를 생성하고 배포합니다.

1.  **Node-RED UI 접속:** 웹 브라우저를 열고 `http://<Node-RED_Host_IP>:1880`으로 접속합니다. (`<Node-RED_Host_IP>`는 Node-RED가 실행 중인 서버의 IP 주소입니다.)
2.  **`Automated Setup Flow` 탭으로 이동:** Node-RED 에디터에서 `Automated Setup Flow`라는 이름의 탭을 클릭하여 이동합니다.
3.  **플로우 실행:** `Run Auto Setup`이라는 이름의 `inject` 노드(파란색 사각형) 왼쪽에 있는 버튼을 클릭합니다. 이 노드는 `plc_address_map_example.json`을 읽고, Modbus 데이터 수집 플로우를 생성한 다음, Admin API를 통해 Node-RED에 배포합니다.

## 5. 데이터 수집 확인

플로우가 성공적으로 배포되었는지 확인하고, PLC에서 데이터가 올바르게 수집되는지 검증합니다.

1.  **새로 생성된 플로우 탭 확인:** 플로우 실행 후, Node-RED 에디터에 `Auto Generated Modbus Flows`라는 새로운 탭이 생성되었는지 확인합니다. 이 탭에는 Modbus Read 노드, Function 노드, Debug 노드가 포함된 플로우가 있을 것입니다.
2.  **디버그 탭 확인:** Node-RED 에디터의 오른쪽 사이드바에 있는 디버그 탭(버그 아이콘)을 클릭합니다.
3.  **데이터 확인:** `PLC_Data_D1000 Output`이라는 이름의 디버그 메시지가 주기적으로 나타나는지 확인합니다. 메시지의 `payload`에 Modbus PLC의 41000 주소에서 수집된 13개의 데이터 값이 포함되어 있어야 합니다.

## 6. 문제 해결

테스트 중 문제가 발생하면 다음 사항을 확인하십시오.

*   **네트워크 연결:** PLC와 Node-RED 서버 간의 네트워크 연결이 안정적인지, 방화벽이 포트 502(또는 설정된 Modbus 포트)를 차단하고 있지 않은지 확인합니다.
*   **PLC Modbus 설정:** PLC 프로그래밍 소프트웨어를 사용하여 PLC의 Modbus TCP/IP 기능이 활성화되어 있고, 올바른 포트와 IP 주소로 설정되어 있는지 확인합니다.
*   **`plc_address_map_example.json`의 정확성:** `address`, `quantity`, `functionCode`, `dataType`, `endianness`가 PLC의 실제 Modbus 레지스터 맵과 정확히 일치하는지 다시 확인합니다. 특히 `dataType`과 `endianness`가 틀리면 데이터가 이상하게 보일 수 있습니다.
*   **Node-RED 로그 확인:** Docker 컨테이너 로그를 확인하여 오류 메시지가 있는지 확인합니다.
    ```bash
    docker logs <node-red-container-id>
    ```
*   **Admin API 토큰:** `settings.js`에 설정된 비밀번호와 `auto_modbus_setup_flow.json`의 `Authorization` 헤더에 사용된 비밀번호가 정확히 일치하는지 확인합니다.

## 결론

이 매뉴얼의 단계를 성공적으로 완료했다면, 폐쇄망 환경에서 Modbus PLC와 Node-RED 간의 Modbus 통신 및 데이터 수집이 가능함을 확인한 것입니다. 다음 단계는 이 테스트 환경을 기반으로 운영 환경 배포를 위한 보안 강화, 안정성 확보, 그리고 추가적인 데이터 처리 및 저장 로직 구현을 고려하는 것입니다.
