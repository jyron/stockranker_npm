if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      console.error('ServiceWorker registration failed: ', err);
    });
  });
}

if ('WebSocket' in window) {
  const ws = new WebSocket('ws://' + window.location.host);
  ws.onopen = function() {
    console.log("WebSocket connection established.");
  };
  ws.onerror = function(error) {
    console.error("WebSocket encountered an error: ", error);
  };
  ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Asset update from server:', data.asset, data.price);
    // Assuming there's a function to update UI with new asset price
    // This is a placeholder for actual UI update logic
    // updateAssetPriceInUI(data.asset, data.price);
  };
  ws.onclose = function() {
    console.log("WebSocket connection closed.");
  };
} else {
  console.error("WebSocket is not supported by this browser.");
}