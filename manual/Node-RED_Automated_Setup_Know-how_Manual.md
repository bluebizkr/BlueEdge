## Node-RED 자동화된 설정 노하우: 구조화된 주소 맵 활용

이 매뉴얼은 Modbus 주소 맵과 같은 구조화된 데이터를 활용하여 Node-RED 플로우 설정을 자동화하는 고급 기법과 노하우를 제공합니다.

### 1. 서론

Node-RED는 시각적인 프로그래밍 환경으로, 노드를 연결하여 플로우를 쉽게 구축할 수 있습니다. 하지만 수십, 수백 개의 Modbus 데이터 포인트를 수집해야 하는 경우, 각 노드를 수동으로 설정하는 것은 비효율적이고 오류 발생 가능성이 높습니다. 이 매뉴얼은 구조화된 주소 맵을 기반으로 Node-RED 플로우 설정을 자동화하는 방법을 제시하여, 이러한 문제를 해결하고 효율성을 극대화하는 데 도움을 줍니다.

### 2. 왜 자동화해야 하는가?

*   **정확성 향상**: 수동 설정 시 발생할 수 있는 오타나 설정 오류를 제거하여 데이터 수집의 정확성을 높입니다.
*   **설정 속도 향상**: 새로운 PLC를 추가하거나 데이터 포인트가 변경될 때, 수동 설정에 비해 훨씬 빠르게 플로우를 배포할 수 있습니다.
*   **확장성**: 대규모 시스템에서 수많은 데이터 포인트를 효율적으로 관리하고 확장할 수 있는 기반을 마련합니다.
*   **유지보수 용이성**: 주소 맵 변경 시, 구조화된 파일만 업데이트하면 되므로 유지보수 부담이 줄어듭니다.
*   **버전 관리**: 구조화된 주소 맵 파일을 버전 관리 시스템(예: Git)으로 관리하여 변경 이력을 추적하고 협업을 용이하게 합니다.
*   **일관성**: 모든 데이터 포인트에 대해 일관된 설정 및 데이터 처리 로직을 적용할 수 있습니다.

### 3. 자동화를 위한 핵심 개념

자동화된 Node-RED 플로우 설정을 위해서는 다음 개념들을 이해하는 것이 중요합니다.

*   **구조화된 데이터 (Structured Data)**:
    *   Modbus 주소 맵과 같은 설정 정보를 JSON 또는 YAML과 같은 기계 판독 가능한 형식으로 정의합니다. 이는 자동화 로직이 데이터를 쉽게 파싱하고 활용할 수 있게 합니다.
*   **Node-RED Admin API**:
    *   Node-RED는 RESTful Admin API를 제공하여 외부 애플리케이션이나 Node-RED 플로우 자체에서 플로우, 노드, 설정을 프로그래밍 방식으로 관리할 수 있게 합니다. 이를 통해 동적으로 플로우를 생성하고 배포할 수 있습니다.
*   **동적 플로우 생성 (Dynamic Flow Generation)**:
    *   구조화된 데이터를 기반으로 Node-RED 플로우의 JSON 표현을 동적으로 생성하는 과정입니다. Node-RED의 모든 플로우와 노드는 내부적으로 JSON 객체로 표현됩니다.
*   **Node-RED의 `function` 노드**:
    *   JavaScript 코드를 사용하여 복잡한 로직을 구현하고 데이터를 변환하는 데 사용됩니다. 구조화된 데이터를 처리하고 플로우 JSON을 생성하는 핵심 역할을 합니다.
*   **Node-RED의 `template` 노드**:
    *   Mustache 템플릿 언어를 사용하여 텍스트 출력을 생성하는 데 유용합니다. 복잡한 JSON 구조를 생성할 때 `function` 노드와 함께 사용될 수 있습니다.

### 4. 구조화된 주소 맵 설계

자동화의 성공은 주소 맵의 설계에 달려 있습니다. 다음은 포함되어야 할 주요 필드와 예시입니다.

*   **필수 필드**:
    *   `name`: 데이터 포인트의 식별 가능한 이름 (예: "Motor_Speed", "Tank_Level")
    *   `address`: Modbus 주소 (0-based 또는 1-based, 명확히 정의)
    *   `functionCode`: Modbus 기능 코드 (예: "Holding Registers", "Coils")
    *   `quantity`: 읽을 레지스터/코일의 개수
    *   `dataType`: 데이터 타입 (예: "int16", "float32", "boolean", "int32")
*   **선택 필드 (자동화 로직에 따라 추가)**:
    *   `endianness`: 데이터의 바이트 순서 (예: "big-endian", "little-endian")
    *   `scaling`: 스케일링 계수 및 오프셋 (예: `{"factor": 0.1, "offset": 0}`)
    *   `unit`: 데이터의 단위 (예: "RPM", "liters")
    *   `pollingRate`: 데이터 수집 주기 (예: "1 second")
    *   `description`: 데이터 포인트에 대한 설명
    *   `nodeId`: Node-RED 노드의 고유 ID (자동 생성될 수 있음)
    *   `wires`: 노드 연결 정보 (자동 생성될 수 있음)

**예시 JSON 구조 (`plc_address_map.json`)**:

```json
[
  {
    "name": "Motor_Speed",
    "address": 40001,
    "functionCode": "Holding Registers",
    "quantity": 1,
    "dataType": "int16",
    "scaling": {"factor": 1, "offset": 0},
    "unit": "RPM",
    "pollingRate": "1 second"
  },
  {
    "name": "Tank_Level",
    "address": 40003,
    "functionCode": "Holding Registers",
    "quantity": 2,
    "dataType": "float32",
    "endianness": "big-endian",
    "scaling": {"factor": 0.1, "offset": 0},
    "unit": "liters",
    "pollingRate": "5 seconds"
  },
  {
    "name": "Pump_Status",
    "address": 1,
    "functionCode": "Coils",
    "quantity": 1,
    "dataType": "boolean",
    "pollingRate": "1 second"
  }
]
```

### 5. Node-RED에서 자동화 플로우 구현 (고수준 단계)

자동화 플로우는 Node-RED 자체 내에서 구축될 수 있습니다.

1.  **트리거 (`Inject` 노드 또는 외부 트리거)**:
    *   수동으로 플로우를 시작하거나, 주기적으로 실행하거나, 외부 이벤트(예: 파일 변경 감지)에 의해 트리거될 수 있습니다.
2.  **주소 맵 읽기 (`File In` 노드)**:
    *   `plc_address_map.json` 파일을 읽어옵니다.
3.  **데이터 파싱 (`JSON` 또는 `YAML` 노드)**:
    *   읽어온 파일 내용을 JavaScript 객체로 변환합니다.
4.  **플로우 JSON 생성 (`function` / `template` 노드)**:
    *   이것이 자동화의 핵심입니다. 파싱된 주소 맵 데이터를 반복하면서 각 데이터 포인트에 대한 Node-RED 노드 객체(예: `modbus-read`, `function` (데이터 변환용), `debug` 등)를 생성합니다.
    *   각 노드의 속성(ID, 타입, 설정, 연결 `wires`)을 동적으로 설정합니다.
    *   특히, `function` 노드의 코드를 문자열로 동적으로 생성하여 데이터 타입 변환 및 스케일링 로직을 포함시킬 수 있습니다.
    *   최종적으로, 생성된 모든 노드 객체를 포함하는 Node-RED 플로우의 JSON 배열을 구성합니다.
5.  **플로우 배포 (`http request` 노드를 Admin API로)**:
    *   생성된 플로우 JSON을 Node-RED Admin API의 `/flows` 엔드포인트로 `POST` 요청을 보냅니다.
    *   **인증**: Admin API는 기본적으로 인증이 필요합니다. `settings.js`에서 `adminAuth`를 설정하고, `http request` 노드에서 적절한 인증 헤더(예: Bearer Token)를 포함해야 합니다.
    *   **API 엔드포인트**: `http://localhost:1880/flows` (Node-RED의 `httpAdminRoot` 설정에 따라 다를 수 있음)

### 6. 모범 사례

*   **간단하게 시작**: 모든 것을 한 번에 자동화하려고 하지 말고, 가장 반복적인 부분부터 시작합니다.
*   **주소 맵 버전 관리**: `plc_address_map.json` 파일을 Git과 같은 버전 관리 시스템으로 관리합니다.
*   **철저한 테스트**: 동적으로 생성된 플로우는 예상대로 작동하는지 철저히 테스트해야 합니다.
*   **오류 처리**: 자동화 플로우 자체에 파일 읽기 오류, JSON 파싱 오류, Admin API 통신 오류 등에 대한 적절한 오류 처리 로직을 포함합니다.
*   **Admin API 보안**: 운영 환경에서는 Node-RED Admin API에 대한 접근을 엄격하게 제어하고, 강력한 인증 메커니즘을 사용해야 합니다.

### 7. 제한 사항 및 고려 사항

*   **복잡성**: 매우 독특하거나 복잡한 노드 구성의 경우, 동적 JSON 생성이 어려울 수 있습니다.
*   **디버깅**: 동적으로 생성된 플로우의 디버깅은 일반적인 플로우 디버깅보다 복잡할 수 있습니다.
*   **Node-RED 버전 호환성**: Admin API 및 노드 JSON 구조는 Node-RED 버전 간에 약간의 차이가 있을 수 있으므로, 특정 버전에 맞춰 개발해야 합니다.

---