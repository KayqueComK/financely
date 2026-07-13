import fs from 'fs';

async function main() {
  try {
    const regRes = await fetch('https://mcp.motion.so/oauth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        client_name: 'Antigravity Agent',
        grant_types: ['urn:ietf:params:oauth:grant-type:device_code', 'refresh_token'],
        token_endpoint_auth_method: 'none'
      })
    });
    const clientData = await regRes.json();
    const clientId = clientData.client_id;
    
    const devRes = await fetch('https://mcp.motion.so/oauth/device_authorization', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: `client_id=${encodeURIComponent(clientId)}&scope=mcp`
    });
    const devData = await devRes.json();
    
    console.log(JSON.stringify({
      clientId,
      ...devData
    }));
  } catch(e) {
    console.error(e);
  }
}
main();
