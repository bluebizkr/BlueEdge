# Node-RED Admin API 설정 매뉴얼

이 매뉴얼은 Node-RED Admin API를 활성화하고, API 토큰을 생성하며, 자동화된 플로우 배포를 위해 Node-RED 플로우 내에서 이 API를 사용하는 방법을 안내합니다.

## 1. Admin API 활성화 및 토큰 생성

Node-RED Admin API를 사용하려면 먼저 Node-RED의 `settings.js` 파일에서 `adminAuth` 설정을 구성해야 합니다. 이 설정은 API에 접근할 수 있는 사용자 및 권한을 정의합니다.

1.  **`config/settings.js` 파일 열기:**
    프로젝트의 `config/settings.js` 파일을 텍스트 편집기로 엽니다.

2.  **`adminAuth` 섹션 추가 또는 수정:**
    `module.exports` 내에 다음 `adminAuth` 섹션을 추가하거나 기존 섹션을 수정합니다. `username`과 `password`를 원하는 값으로 설정합니다. `password` 필드에는 **일반 텍스트 비밀번호가 아닌 해시된 비밀번호**를 사용해야 합니다.

    ```javascript
    // config/settings.js
    module.exports = {
        // ... 다른 설정 ...

        adminAuth: {
            type: "credentials",
            users: [
                {
                    username: "admin", // 원하는 사용자 이름으로 변경
                    password: "$2a$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // 여기에 해시된 비밀번호를 넣으세요.
                    permissions: "*", // 이 사용자의 권한을 정의합니다. 모든 권한을 부여하려면 "*"를 사용합니다.
                }
            ]
        },

        // ... 다른 설정 ...
    };
    ```

3.  **해시된 비밀번호 생성:**
    해시된 비밀번호를 생성하려면 Node-RED가 설치된 환경에서 터미널을 열고 다음 명령을 실행합니다. `YOUR_SECRET_PASSWORD`를 Admin API 토큰으로 사용할 실제 비밀번호로 바꾸세요.

    ```bash
    node -e "console.log(require('bcryptjs').hashSync('YOUR_SECRET_PASSWORD', 8));"
    ```
    이 명령의 출력은 `settings.js` 파일의 `password` 필드에 붙여넣을 해시된 문자열입니다.

## 2. Node-RED 플로우에서 Admin API 사용

`auto_modbus_setup_flow.json`과 같은 Node-RED 플로우에서 Admin API를 사용하여 플로우를 배포하거나 다른 관리 작업을 수행할 수 있습니다. 이는 일반적으로 `http request` 노드를 통해 이루어집니다.

1.  **`http request` 노드 확인:**
    `auto_modbus_setup_flow.json` 플로우 내에서 `Deploy Flow via Admin API`라는 이름의 `http request` 노드를 찾습니다. 이 노드는 Node-RED Admin API 엔드포인트로 HTTP POST 요청을 보냅니다.

2.  **`Authorization` 헤더 업데이트:**
    `http request` 노드의 설정에서 `Headers` 섹션을 찾아 `Authorization` 헤더를 다음과 같이 업데이트합니다. `YOUR_ADMIN_API_TOKEN`을 1단계에서 `settings.js`에 설정한 **실제 비밀번호**로 바꿉니다. (참고: `adminAuth`를 사용하는 경우, 토큰은 일반적으로 사용자의 비밀번호입니다. 프로덕션 환경에서는 더 안전한 방법을 고려해야 합니다.)

    ```json
    {
        "p": "Authorization",
        "v": "Bearer YOUR_ADMIN_API_TOKEN"
    }
    ```

    *   `URL`: `http://localhost:1880/red/flows` (Node-RED 인스턴스의 주소에 따라 변경될 수 있습니다.)
    *   `Method`: `POST`
    *   `Payload`: 배포할 플로우 JSON (이 경우 `generate_flow_json` 노드에서 생성된 `msg.payload`)

## 3. 보안 고려 사항

Admin API 토큰은 Node-RED 인스턴스에 대한 강력한 접근 권한을 부여하므로, 다음 보안 지침을 따르는 것이 중요합니다.

*   **토큰 보안:** Admin API 토큰(또는 비밀번호)은 매우 민감한 정보입니다. 프로덕션 환경에서는 이를 환경 변수나 보안 저장소에 저장하고, 코드에 직접 하드코딩하는 것을 피해야 합니다.
*   **권한 제한:** `settings.js`에서 `permissions`를 `"*"`로 설정하는 대신, API 토큰에 필요한 최소한의 권한만 부여하는 것이 좋습니다. 예를 들어, 플로우 배포만 허용하려면 특정 권한만 나열할 수 있습니다.

## 결론

이 매뉴얼의 단계를 따르면 Node-RED Admin API를 성공적으로 설정하고, 자동화된 플로우 배포를 위해 플로우 내에서 이를 활용할 수 있습니다. 항상 보안 모범 사례를 염두에 두고 API 토큰을 안전하게 관리하세요.
