import csv from 'csv-parse/lib/sync'
import { Data, Tag, Transaction } from 'common';
import { shallowReactive } from 'vue';

export interface Import {
  doImport(): void;
}

export function initImport(data: Data): Import {
  return {
    async doImport() {
      const [file] = await window.showOpenFilePicker({
        types: [{
          description: 'CSV',
          accept: {
            'text/csv': ['.csv'],
          },
        }],
      });

      const fileData = await file.getFile();
      const fileText = await fileData.text();

      const rows: string[][] = csv(fileText, {
        from_line: 2,
      });

      const loaded = rows.map(row => Transaction.load(row));
      loaded.reverse();

      const mostRecent = data.transactions[data.transactions.length - 1];
      const index = mostRecent != null
        ? loaded.findIndex(t => Transaction.eq(mostRecent, t)) + 1
        : 0;

      const newTransactions = loaded.slice(index);
      data.transactions.push(...newTransactions);
      data.expenses.push(...newTransactions.map(t => {
        return shallowReactive({
          transaction: t,
          tags: shallowReactive(new Set<Tag>()),
          details: '',
        });
      }));
    },
  };
}
