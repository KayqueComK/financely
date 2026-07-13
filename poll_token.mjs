import fs from 'fs';

async function poll() {
  const clientId = "6500385e-dfc3-4966-9ef2-52d2be0774a7";
  const deviceCode = "VEAKlatOfY7y-Phh5EZf4Vb_jL07Ow_SBUv5dL95N9Y";
  const interval = 5000;
  
  console.log("Polling for token...");
  while(true) {
    try {
      const res = await fetch('https://mcp.motion.so/oauth/token', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=${encodeURIComponent(deviceCode)}&client_id=${encodeURIComponent(clientId)}`
      });
      const data = await res.json();
      if (data.access_token) {
        console.log("TOKEN RECEIVED");
        fs.writeFileSync('motion_token.json', JSON.stringify(data, null, 2));
        process.exit(0);
      } else if (data.error === 'authorization_pending') {
        // keep polling
      } else if (data.error === 'slow_down') {
        await new Promise(r => setTimeout(r, interval + 5000));
        continue;
      } else {
        console.log("ERROR", data);
        process.exit(1);
      }
    } catch(e) {
      console.error(e);
    }
    await new Promise(r => setTimeout(r, interval));
  }
}
poll();
