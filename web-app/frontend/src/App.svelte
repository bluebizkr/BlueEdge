<script>
  import { onMount } from 'svelte';

  let plcData = {};
  let ws;

  onMount(() => {
    

    // WebSocket connection to receive real-time data from Node-RED via backend
    ws = new WebSocket(`ws://${window.location.hostname}:3001`); // Connect to backend WebSocket server

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = event => {
      const newData = JSON.parse(event.data);
      console.log('Received WebSocket data:', newData);
      // Update plcData with all key-value pairs from the received data
      plcData = { ...plcData, ...newData };
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  });
</script>

<style>
  main {
    font-family: sans-serif;
    text-align: center;
    padding: 20px;
  }
  h1 {
    color: #333;
  }
  .data-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }
  .data-item {
    background-color: #f0f0f0;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .data-item h3 {
    margin-top: 0;
    color: #555;
  }
  .data-item p {
    font-size: 1.5em;
    font-weight: bold;
    color: #007bff;
  }
</style>

<main>
  <h1>PLC 모니터링 대시보드</h1>

  <div class="data-grid">
    {#each Object.entries(plcData) as [key, value]}
      <div class="data-item">
        <h3>{key}</h3>
        <p>{value}</p>
      </div>
    {/each}
  </div>
</main>
