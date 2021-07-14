import { assert } from '@mfro/ts-common/assert';
import { Data, Tag, Transaction } from 'common';

interface V0 {
  transactions: Transaction[];
  tags: Tag[];
  labels: { details: string, tags: number[] }[];
  expenses: { transaction: number, label: number }[];
}

function loadV0(src: V0, data: Data) {
  data.transactions.push(...src.transactions);
  data.tags.push(...src.tags);

  const expenses = src.expenses.map(e => ({
    details: src.labels[e.label].details,
    tags: new Set(src.labels[e.label].tags.map(i => data.tags[i])),
    transaction: data.transactions[e.transaction],
  })).filter(e =>
    [...e.tags].every(t => t) && e.transaction
  ).sort((a, b) =>
    data.transactions.indexOf(b.transaction) - data.transactions.indexOf(a.transaction)
  );

  data.expenses.push(...expenses);
}

interface V1 {
  transactions: Transaction[];
  tags: Tag[];
  expenses: { transaction: number, tags: number[], details: string }[];
}

function loadV1(src: V1, data: Data) {
  data.transactions.push(...src.transactions);
  data.tags.push(...src.tags);

  const expenses = src.expenses.map(e => ({
    details: e.details,
    tags: new Set(e.tags.map(i => data.tags[i])),
    transaction: data.transactions[e.transaction],
  })).filter(e =>
    [...e.tags].every(t => t) && e.transaction
  ).sort((a, b) =>
    data.transactions.indexOf(b.transaction) - data.transactions.indexOf(a.transaction)
  );

  data.expenses.push(...expenses);
  data.transactions.reverse();
}

interface V2 {
  transactions: Transaction[];
  tags: Tag[];
  expenses: { transaction: number, tags: number[], details: string }[];
}

function loadV2(src: V2, data: Data) {
  data.transactions.push(...src.transactions);
  data.tags.push(...src.tags);

  const expenses = src.expenses.map(e => ({
    details: e.details,
    tags: new Set(e.tags.map(i => data.tags[i])),
    transaction: data.transactions[e.transaction],
  })).filter(e =>
    [...e.tags].every(t => t) && e.transaction
  ).sort((a, b) =>
    data.transactions.indexOf(a.transaction) - data.transactions.indexOf(b.transaction)
  );

  data.expenses.push(...expenses);
}

export function load(data: Data, raw: string | null) {
  if (raw != null) {
    const { version, ...src } = JSON.parse(raw);

    if (version === 2) return loadV2(src, data);
    if (version === 1) return loadV1(src, data);
    if (version === undefined) return loadV0(src, data);

    assert(false, `invalid version: ${version}`);
  }
}

export function save(data: Data) {
  const version = 2;

  const transactions = data.transactions.map(t => ({
    date: t.date,
    value: t.value,
    description: t.description,
    category: t.category,
    balance: t.balance,
  }));

  const tags = data.tags.map(t => ({
    value: t.value,
  }));

  const expenses = data.expenses.map(e => ({
    transaction: data.transactions.indexOf(e.transaction),
    tags: [...e.tags].map(t => data.tags.indexOf(t)),
    details: e.details,
  }));

  return JSON.stringify({ transactions, tags, expenses, version }, undefined, '  ');
}
