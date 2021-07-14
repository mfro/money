import * as path from 'path';
import { promises as fs } from 'fs';
import pdfParse from 'pdf-parse';
import { assert } from '@mfro/ts-common/assert';

import { Date, Money, Transaction } from 'common';

const dir = '/home/mfro/home/Desktop/stuff/bank statements/spend';

function extractData(src: string, statementMonth: number, statementYear: number, collect: Transaction[]) {
  const lines = src.split('\n');

  const mark1 = lines.indexOf('Deposits and Other Additions');
  let mark2 = lines.indexOf('Banking/Debit Card Withdrawals and Purchases');
  if (mark2 < 0) mark2 = lines.indexOf('Banking/Check Card Withdrawals and Purchases');
  assert(mark2 > mark1, 'mark');

  let index = 0;
  while (true) {
    index = lines.indexOf('DateAmountDescription', index) + 1;
    if (index == 0) break;

    const isDeposit = index > mark1 && index < mark2;
    assert(isDeposit || index > mark2, 'isDeposit');

    type Building = { day: number, month: number, value: string, description: string };
    let building = null as null | Building;

    function finish(building: Building) {
      const date = { day: building.day, month: building.month, year: statementYear };
      if (statementMonth == 1 && building.month == 12) date.year -= 1;

      const value = Money.load(`$0${building.value}`);
      if (!isDeposit) value.cents = -value.cents;


      collect.push({
        date,
        value,
        category: '',
        description: building.description,
        balance: { cents: 0 },
      });
    }

    for (const line of lines.slice(index)) {
      const match = /^(\d\d)\/(\d\d)\s*([\d,]*\.\d\d)\s*/.exec(line);

      if (match) {
        if (building) finish(building);

        const month = parseInt(match[1]);
        const day = parseInt(match[2]);
        building = { day, month, value: match[3], description: line.slice(match[0].length) };
      } else if (building != null) {
        if (building.description.length + line.length <= 59) {
          building.description += ` ${line}`;
        } else {
          break;
        }

        finish(building);
        building = null;
      } else {
        break;
      }
    }

    if (building) finish(building);
  }
}

async function main() {
  const entries = await fs.readdir(dir);

  const collection: Transaction[] = [];

  for (const name of entries) {
    const fullPath = path.join(dir, name);
    const rawPdf = await fs.readFile(fullPath);

    const pdf = await pdfParse(rawPdf);

    const match = /Statement_(\w+)_(\d+)_(\d+)\.pdf/.exec(name);
    assert(match != null, 'match');

    const year = parseInt(match[3]);
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(match[1]) + 1;

    extractData(pdf.text, month, year, collection);
  }

  collection.push(
    {"date":{"day":19,"month":9,"year":2018},"value":{"cents":-267500},"category":"","description":"check for Elliot","balance":{"cents":0}}
  )

  collection.sort((a, b) => {
    if (a.date.year != b.date.year) return a.date.year - b.date.year;
    if (a.date.month != b.date.month) return a.date.month - b.date.month;
    if (a.date.day != b.date.day) return a.date.day - b.date.day;
    return 0;
  });

  let balance = 0;
  for (const transaction of collection) {
    balance += transaction.value.cents;
    transaction.balance.cents = balance;
  }

  collection.splice(638, collection.length);

  console.log(JSON.stringify(collection));
  // for (const entry of collection) {
  //   console.log(JSON.stringify(entry));
  // }
}

main();
