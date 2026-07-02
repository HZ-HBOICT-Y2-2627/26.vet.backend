#!/usr/bin/env node

/**
 * API GATEWAY TEST SUITE
 *
 * Run the gateway first: npm run dev
 * Make sure the registry service is also running on port 4000.
 * Then run: node test-api.js
 */

const http = require('http');

const PORT = 3000;

async function request(method, path) {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'localhost', port: PORT, method, path };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

const tests = [
  { name: 'Health check',       fn: () => request('GET', '/health') },
  { name: 'Get all animals',    fn: () => request('GET', '/animals') },
];

async function runTests() {
  console.log('\nAPI GATEWAY TEST SUITE\n');
  console.log('Make sure the gateway is running: npm run dev\n');

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      const result = await test.fn();
      const ok = result.status >= 200 && result.status < 300;
      console.log(`  ${ok ? 'OK' : 'FAIL'} (${result.status})\n`);
    } catch (error) {
      console.log(`  Connection Error: ${error.message}`);
      console.log(`  Make sure the gateway is running on port ${PORT}\n`);
      break;
    }
  }

  console.log('Tests completed!\n');
}

runTests();
