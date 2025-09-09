## Node-RED를 이용한 Modbus 데이터 수집 매뉴얼 (주소 맵 활용)

이 매뉴얼은 LS PLC의 Modbus 주소 맵을 기반으로 Node-RED에서 Modbus 데이터를 효과적으로 수집하고 처리하는 방법을 안내합니다.

### 1. 서론

이 문서는 Node-RED 환경이 설정되고 `node-red-contrib-modbus` 팔레트가 설치되었다는 전제 하에, Modbus 주소 맵을 활용하여 PLC로부터 데이터를 읽어오는 구체적인 방법을 설명합니다. 올바른 주소와 데이터 타입을 사용하여 정확한 데이터를 수집하는 것이 목표입니다.

### 2. 전제 조건

*   **Node-RED 환경 실행 중**: Docker Compose를 통해 Node-RED가 정상적으로 실행되고 있어야 합니다.
*   **`node-red-contrib-modbus` 팔레트 설치 완료**: Node-RED에 Modbus 팔레트가 설치되어 있어야 합니다.
*   **LS PLC Modbus 주소 맵 확보**: 연결하려는 LS PLC의 Modbus 주소 맵(레지스터/코일 주소, 데이터 타입, 기능 코드 등)을 정확히 알고 있어야 합니다.

### 3. Modbus 주소 맵 이해

Modbus 주소 맵은 PLC 내의 데이터가 어떤 주소에 어떤 형식으로 저장되어 있는지를 정의한 문서입니다. 데이터를 정확히 읽기 위해서는 다음 요소들을 이해해야 합니다.

*   **기능 코드 (Function Code)**:
    *   **Coils (0x)**: 디지털 출력 (읽기/쓰기)
    *   **Discrete Inputs (1x)**: 디지털 입력 (읽기 전용)
    *   **Input Registers (3x)**: 아날로그 입력 (읽기 전용)
    *   **Holding Registers (4x)**: 아날로그 출력/내부 데이터 (읽기/쓰기)
*   **주소 (Address)**: 각 데이터 항목의 고유한 위치입니다. PLC 제조사나 모델에 따라 0-based 또는 1-based 주소 체계를 사용할 수 있습니다. (예: 40001번 레지스터는 0-based로 40000일 수 있습니다.)
*   **수량 (Quantity)**: 읽으려는 레지스터 또는 코일의 개수입니다.
*   **데이터 타입 (Data Type)**: 레지스터에 저장된 데이터의 형식입니다. (예: 16비트 정수, 32비트 정수, 32비트 부동 소수점(Float), BCD 등). Modbus는 기본적으로 16비트 워드 단위로 데이터를 전송하므로, 32비트 데이터는 두 개의 16비트 레지스터에 걸쳐 저장됩니다.

### 4. Node-RED 플로우를 이용한 데이터 수집

Node-RED에서 Modbus 데이터를 수집하는 일반적인 플로우는 다음과 같습니다.

#### 4.1. Modbus-TCP-Client (Server) 설정

Modbus 통신을 위한 PLC 연결 정보를 설정합니다.

1.  Node-RED 에디터에서 `Modbus Read` 또는 `Modbus Flex Read` 노드를 플로우로 드래그합니다.
2.  노드를 더블 클릭하여 설정 창을 엽니다.
3.  "Server" 옆의 연필 아이콘을 클릭하여 새 Modbus Server를 추가합니다.
    *   **Type**: `TCP`를 선택합니다.
    *   **Host**: LS PLC의 **IP 주소**를 입력합니다.
    *   **Port**: 일반적으로 Modbus TCP의 기본 포트는 `502`입니다. PLC 설정에 따라 다를 수 있으니 확인 후 입력하세요.
    *   **Unit-Id**: PLC의 Modbus Unit ID를 입력합니다. (대부분의 Modbus TCP 통신에서는 1로 설정되거나 무시될 수 있습니다. PLC 설명서를 확인하세요.)
    *   "Add"를 클릭하여 서버 설정을 저장합니다.

#### 4.2. Modbus Read 노드 사용

`Modbus Read` 노드는 특정 주소의 데이터를 주기적으로 읽어오는 데 사용됩니다.

1.  **Function**: PLC 주소 맵에 따라 읽으려는 데이터 유형의 기능 코드를 선택합니다. (예: `Holding Registers` (4x), `Input Registers` (3x), `Coils` (0x), `Discrete Inputs` (1x)).
2.  **Address**: PLC 주소 맵에 명시된 **시작 주소**를 입력합니다. (예: 40001번 레지스터를 읽으려면 0-based 주소인 40000을 입력할 수 있습니다. PLC 설명서 확인 필수).
3.  **Quantity**: 읽으려는 레지스터 또는 코일의 **개수**를 입력합니다. (예: 32비트 Float 값을 읽으려면 2개의 16비트 레지스터가 필요하므로 Quantity를 2로 설정합니다.)
4.  **Polling Rate**: 데이터를 읽어올 주기를 설정합니다 (예: 1초마다).
5.  **Name**: 노드의 이름을 지정합니다 (예: "온도 센서 값 읽기").

#### 4.3. 데이터 처리 (`Function` 노드 활용)

Modbus Read 노드에서 읽어온 데이터는 일반적으로 16비트 정수 배열(`msg.payload.data`) 형태로 들어옵니다. PLC 주소 맵에 따라 이 데이터를 실제 값으로 변환해야 할 수 있습니다. `Function` 노드를 사용하여 JavaScript 코드로 데이터를 처리합니다.

**예시: 32비트 부동 소수점(Float) 값 변환**

PLC에서 32비트 Float 값이 두 개의 Holding Register(예: 40001, 40002)에 저장되어 있다면, `Modbus Read` 노드에서 Address를 40000 (0-based), Quantity를 2로 설정하여 읽어옵니다.

`Function` 노드에 다음 코드를 사용하여 16비트 정수 배열을 32비트 Float으로 변환할 수 있습니다.

```javascript
// msg.payload.data는 [register1_value, register2_value] 형태의 배열
var buffer = Buffer.alloc(4); // 4바이트 버퍼 생성 (32비트 = 4바이트)

// Modbus는 일반적으로 Big-Endian (MSB 먼저)
// 레지스터 값을 버퍼에 씁니다.
// 첫 번째 레지스터 (msg.payload.data[0])는 상위 16비트, 두 번째 레지스터 (msg.payload.data[1])는 하위 16비트
buffer.writeUInt16BE(msg.payload.data[0], 0); // 첫 번째 레지스터를 버퍼의 0번째 바이트부터 Big-Endian으로 씁니다.
buffer.writeUInt16BE(msg.payload.data[1], 2); // 두 번째 레지스터를 버퍼의 2번째 바이트부터 Big-Endian으로 씁니다.

// 버퍼에서 32비트 Float 값을 읽습니다.
var floatValue = buffer.readFloatBE(0); // 버퍼의 0번째 바이트부터 Big-Endian Float 값을 읽습니다.

msg.payload = floatValue; // 변환된 Float 값을 payload에 할당
return msg;
```
**참고**: PLC의 Modbus 구현에 따라 Endianness (Big-Endian/Little-Endian)가 다를 수 있습니다. PLC 설명서를 확인하고 `writeUInt16BE`/`writeUInt16LE`, `readFloatBE`/`readFloatLE` 등을 적절히 사용해야 합니다.

#### 4.4. 데이터 확인 및 저장/표시

*   **데이터 확인 (`Debug` 노드)**: `Function` 노드 뒤에 `Debug` 노드를 연결하여 변환된 데이터가 올바른지 확인합니다. Node-RED 디버그 사이드바에서 결과를 볼 수 있습니다.
*   **데이터 저장/표시**:
    *   **대시보드**: `node-red-dashboard` 팔레트를 설치하여 UI 노드(Gauge, Chart, Text 등)를 사용하여 데이터를 시각화할 수 있습니다.
    *   **데이터베이스**: `node-red-contrib-influxdb`, `node-red-node-mysql` 등과 같은 팔레트를 사용하여 데이터를 시계열 데이터베이스(InfluxDB)나 관계형 데이터베이스(MySQL)에 저장할 수 있습니다.
    *   **MQTT**: `mqtt out` 노드를 사용하여 데이터를 MQTT 브로커로 발행하여 다른 시스템에서 구독할 수 있도록 합니다.

### 5. 예제 플로우: Holding Register 값 읽기

다음은 LS PLC의 40001번 Holding Register (0-based 주소 40000)에서 16비트 정수 값을 읽어와 디버그 창에 표시하는 간단한 플로우 예시입니다.

1.  `Modbus Read` 노드를 플로우로 드래그합니다.
2.  노드를 더블 클릭하여 Modbus Server를 PLC IP 주소와 포트 502로 설정합니다.
3.  `Modbus Read` 노드 설정:
    *   **Function**: `Holding Registers`
    *   **Address**: `40000`
    *   **Quantity**: `1`
    *   **Polling Rate**: `1 second`
    *   **Name**: `PLC_Value_40001`
4.  `Debug` 노드를 플로우로 드래그하고 `Modbus Read` 노드의 출력에 연결합니다.
5.  `Debug` 노드를 더블 클릭하여 "Output"을 `msg.payload`로 설정합니다.
6.  "Deploy" 버튼을 클릭하여 플로우를 배포합니다.

이제 디버그 창에서 1초마다 PLC의 40001번 레지스터 값을 확인할 수 있습니다.

### 6. 문제 해결

*   **Modbus 통신 오류**:
    *   PLC의 IP 주소, 포트, Unit ID가 정확한지 다시 확인합니다.
    *   PLC가 Modbus 통신을 허용하도록 설정되어 있는지, 그리고 네트워크 방화벽이 Modbus 포트(기본 502)를 차단하고 있지 않은지 확인합니다.
    *   `Modbus Read` 노드의 상태 메시지를 확인하여 통신 오류가 있는지 파악합니다.
*   **잘못된 데이터 값**:
    *   **주소 불일치**: PLC 주소 맵과 Node-RED의 Address 설정이 정확히 일치하는지 (0-based vs 1-based) 다시 확인합니다.
    *   **데이터 타입 불일치**: PLC에서 저장된 데이터 타입과 `Function` 노드에서 변환하는 방식이 일치하는지 확인합니다. 특히 32비트 값의 Endianness를 주의 깊게 확인합니다.
    *   **Quantity 부족**: 32비트 값처럼 여러 레지스터에 걸쳐 저장되는 데이터의 경우 Quantity가 충분히 설정되었는지 확인합니다.
*   **Node-RED 로그 확인**: Node-RED 컨테이너의 로그(`docker-compose logs nodered`)를 확인하여 Modbus 통신 관련 상세 오류 메시지를 파악합니다.

---