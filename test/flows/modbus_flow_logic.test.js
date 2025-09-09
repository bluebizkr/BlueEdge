const helper = require('node-red-node-test-helper');
const should = require('should'); // Using should.js for assertions

// Import the Node-RED nodes that your function node might depend on
// In this case, the function node itself is the primary focus.
// We'll simulate the input from a modbus-read node.

// Define the Node-RED flow for testing the function node
// This flow will contain only the function node and a debug node to capture output
const testFlow = [
    {
        id: "n1",
        type: "function",
        name: "Process Modbus Data",
        func: `const addressMap = msg.payload;

// Generate a unique ID for the new flow tab
const newFlowTabId = RED.util.generateId();
const newFlowTabName = "Auto Generated Modbus Flows";

const newFlow = {
    "id": newFlowTabId,
    "type": "tab",
    "label": newFlowTabName,
    "disabled": false,
    "info": "Flows automatically generated from PLC address map"
};

const nodes = [newFlow];
const modbusServerId = RED.util.generateId();

// Add a single Modbus Server config node for all Modbus Read nodes to share
// User needs to manually configure this server after deployment
nodes.push({
    "id": modbusServerId,
    "type": "modbus-client",
    "name": "LS PLC Modbus TCP",
    "server": "127.0.0.1", // Placeholder: User must change to actual PLC IP
    "port": "502",
    "unit_id": "1",
    "tcp_type": "DEFAULT",
    "x": 0, // Not visible on flow, just a config node
    "y": 0, // Not visible on flow
    "wires": [],
    "_users": [] // This will be populated by Node-RED when nodes link to it
});

addressMap.forEach(item => {
    const modbusReadNodeId = RED.util.generateId();
    const functionNodeId = RED.util.generateId();
    const debugNodeId = RED.util.generateId();

    // Modbus Read Node
    nodes.push({
        "id": modbusReadNodeId,
        "type": "modbus-read",
        "z": newFlowTabId, // Assign to the new flow tab
        "name": `Read ${item.name}`,
        "topic": item.name,
        "showStatusActivities": false,
        "showErrors": false,
        "unitid": item.unitId || "1", // Use item.unitId if provided, else default to 1
        "dataType": item.functionCode, // e.g., "Holding Registers", "Coils"
        "adr": item.address - (item.functionCode.includes("Registers") ? 40000 : 0), // Adjust for 0-based addressing if needed
        "quantity": item.quantity,
        "rate": item.pollingRate || "1 second",
        "rateUnit": "1 second",
        "server": modbusServerId, // Link to the shared Modbus Server config node
        "ieee_address_offset": "",
        "x": 200,
        "y": 100 + nodes.length * 80, // Position nodes vertically
        "wires": [
            [functionNodeId]
        ]
    });

    // Function Node for Data Type Conversion and Scaling
    let funcCode = `
        let value = msg.payload.data;
        let result = value;

        // Data Type Conversion
        switch ('${item.dataType}') {
            case 'int16':
                // Already int16, no special conversion needed for single register
                result = value[0];
                break;
            case 'int32':
                // Assuming two 16-bit registers for 32-bit int
                // Need to handle endianness
                if (value.length >= 2) {
                    let buffer = Buffer.alloc(4);
                    if ('${item.endianness}' === 'little-endian') {
                        buffer.writeUInt16LE(value[0], 0);
                        buffer.writeUInt16LE(value[1], 2);
                    } else { // Default to big-endian
                        buffer.writeUInt16BE(value[0], 0);
                        buffer.writeUInt16BE(value[1], 2);
                    }
                    result = buffer.readInt32BE(0); // Assuming Big-Endian for read, adjust if needed
                }
                break;
            case 'float32':
                // Assuming two 16-bit registers for 32-bit float
                if (value.length >= 2) {
                    let buffer = Buffer.alloc(4);
                    if ('${item.endianness}' === 'little-endian') {
                        buffer.writeUInt16LE(value[0], 0);
                        buffer.writeUInt16LE(value[1], 2);
                    } else { // Default to big-endian
                        buffer.writeUInt16BE(value[0], 0);
                        buffer.writeUInt16BE(value[1], 2);
                    }
                    result = buffer.readFloatBE(0); // Assuming Big-Endian for read, adjust if needed
                }
                break;
            case 'boolean':
                // For coils/discrete inputs, value[0] is 0 or 1
                result = (value[0] === 1);
                break;
            // Add more data types as needed
        }

        // Scaling
        if (${item.scaling && item.scaling.factor !== undefined}) {
            result = result * ${item.scaling.factor};
        }
        if (${item.scaling && item.scaling.offset !== undefined}) {
            result = result + ${item.scaling.offset};
        }

        msg.payload = result;
        msg.topic = '${item.name}';
        msg.unit = '${item.unit || ''}';
        return msg;
    `

    nodes.push({
        "id": functionNodeId,
        "type": "function",
        "z": newFlowTabId,
        "name": `Process ${item.name}`,
        "func": funcCode,
        "outputs": 1,
        "noerr": 0,
        "initialize": "",
        "finalize": "",
        "libs": [],
        "x": 400,
        "y": 100 + nodes.length * 80,
        "wires": [
            [debugNodeId]
        ]
    });

    // Debug Node
    nodes.push({
        "id": debugNodeId,
        "type": "debug",
        "z": newFlowTabId,
        "name": `${item.name} Output`,
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 600,
        "y": 100 + nodes.length * 80,
        "wires": []
    });
});

msg.payload = nodes;
return msg;
`,
        outputs: 1,
        noerr: 0,
        initialize: "",
        finalize: "",
        libs: [],
        wires: [["n2"]]
    },
    { id: "n2", type: "helper" } // Helper node to capture output
];

describe('Modbus Flow Function Node Logic', function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload().then(function () {
            helper.stopServer(done);
        });
    });

    // Test Case 1: int16 with scaling (from plc_address_map_example.json)
    it('should process int16 data with scaling correctly (Motor_Speed_RPM)', function (done) {
        const flow = testFlow;
        helper.load(flow, function () {
            const n1 = helper.getNode("n1"); // Our function node
            const n2 = helper.getNode("n2"); // Our helper node (debug)

            n2.on("input", function (msg) {
                try {
                    // Simulating input for Motor_Speed_RPM
                    // item.dataType: 'int16', item.scaling: {factor: 1, offset: 0}
                    // Input: [123] (simulating modbus-read output for int16)
                    // Expected: 123 * 1 + 0 = 123
                    msg.payload.should.be.exactly(123);
                    msg.topic.should.be.exactly('Motor_Speed_RPM');
                    msg.unit.should.be.exactly('RPM');
                    done();
                } catch (err) {
                    done(err);
                }
            });

            // Simulate input to the function node
            n1.receive({
                payload: { data: [123] },
                _item: { // Mocking the 'item' object passed from generate_flow_json
                    name: 'Motor_Speed_RPM',
                    dataType: 'int16',
                    scaling: { factor: 1, offset: 0 },
                    unit: 'RPM'
                }
            });
        });
    });

    // Test Case 2: float32 with scaling and big-endian (from plc_address_map_example.json)
    it('should process float32 data with scaling and big-endian correctly (Tank_Level_Liters)', function (done) {
        const flow = testFlow;
        helper.load(flow, function () {
            const n1 = helper.getNode("n1"); // Our function node
            const n2 = helper.getNode("n2"); // Our helper node (debug)

            n2.on("input", function (msg) {
                try {
                    // Simulating input for Tank_Level_Liters
                    // item.dataType: 'float32', item.endianness: 'big-endian', item.scaling: {factor: 0.1, offset: 0}
                    // Input: [16975, 17000] (simulating modbus-read output for float32, big-endian)
                    // This corresponds to 123.45 in IEEE 754 float32
                    // Expected: 123.45 * 0.1 + 0 = 12.345
                    msg.payload.should.be.approximately(12.345, 0.001); // Use approximately for floats
                    msg.topic.should.be.exactly('Tank_Level_Liters');
                    msg.unit.should.be.exactly('liters');
                    done();
                } catch (err) {
                    done(err);
                }
            });

            // Simulate input to the function node
            // To get [16975, 17000] from 123.45 (float32, big-endian):
            // let buf = Buffer.alloc(4); buf.writeFloatBE(123.45, 0); console.log(buf.readUInt16BE(0), buf.readUInt16BE(2));
            n1.receive({
                payload: { data: [16975, 17000] },
                _item: { // Mocking the 'item' object passed from generate_flow_json
                    name: 'Tank_Level_Liters',
                    dataType: 'float32',
                    endianness: 'big-endian',
                    scaling: { factor: 0.1, offset: 0 },
                    unit: 'liters'
                }
            });
        });
    });

    // Test Case 3: boolean (from plc_address_map_example.json)
    it('should process boolean data correctly (Pump_Status_Run)', function (done) {
        const flow = testFlow;
        helper.load(flow, function () {
            const n1 = helper.getNode("n1"); // Our function node
            const n2 = helper.getNode("n2"); // Our helper node (debug)

            n2.on("input", function (msg) {
                try {
                    // Simulating input for Pump_Status_Run
                    // item.dataType: 'boolean'
                    // Input: [1] (simulating modbus-read output for boolean true)
                    // Expected: true
                    msg.payload.should.be.true();
                    msg.topic.should.be.exactly('Pump_Status_Run');
                    msg.unit.should.be.exactly(''); // No unit defined in example
                    done();
                } catch (err) {
                    done(err);
                }
            });

            // Simulate input to the function node
            n1.receive({
                payload: { data: [1] },
                _item: { // Mocking the 'item' object passed from generate_flow_json
                    name: 'Pump_Status_Run',
                    dataType: 'boolean',
                    unit: ''
                }
            });
        });
    });

    // Test Case 4: int16 with scaling (Sensor_Temperature_C)
    it('should process int16 data with scaling correctly (Sensor_Temperature_C)', function (done) {
        const flow = testFlow;
        helper.load(flow, function () {
            const n1 = helper.getNode("n1"); // Our function node
            const n2 = helper.getNode("n2"); // Our helper node (debug)

            n2.on("input", function (msg) {
                try {
                    // Simulating input for Sensor_Temperature_C
                    // item.dataType: 'int16', item.scaling: {factor: 0.1, offset: 0}
                    // Input: [250] (simulating modbus-read output for int16)
                    // Expected: 250 * 0.1 + 0 = 25
                    msg.payload.should.be.exactly(25);
                    msg.topic.should.be.exactly('Sensor_Temperature_C');
                    msg.unit.should.be.exactly('Celsius');
                    done();
                } catch (err) {
                    done(err);
                }
            });

            // Simulate input to the function node
            n1.receive({
                payload: { data: [250] },
                _item: { // Mocking the 'item' object passed from generate_flow_json
                    name: 'Sensor_Temperature_C',
                    dataType: 'int16',
                    scaling: { factor: 0.1, offset: 0 },
                    unit: 'Celsius'
                }
            });
        });
    });

});
