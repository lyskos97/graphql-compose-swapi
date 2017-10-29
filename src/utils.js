/* @flow */

import type { TypeComposer } from 'graphql-compose';
import fetch from 'node-fetch';

export async function loadData(url: string) {
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.count && data.results) {
    return data.results;
  }
  return data;
}

export async function loadBulk(urls: Array<string>) {
  return Promise.all(urls.map(u => loadData(u)));
}

export function createFindByIdResolver(tc: TypeComposer, urlAddr: string): void {
  tc.addResolver({
    name: 'findById',
    type: tc,
    args: {
      id: 'Int!',
    },
    resolve: async rp => {
      // const res = await fetch(`https://swapi.co/api/${urlAddr}/${rp.args.id}/`);
      // const data = await res.json();
      // return data;
      return rp.context.loader.load(`https://swapi.co/api/${urlAddr}/${rp.args.id}/`);
    },
  });
}

export function createFindListByPageNumberResolver(tc: TypeComposer, urlAddr: string): void {
  tc.addResolver({
    name: 'findListByPageNumber',
    type: [tc],
    args: {
      page: { type: 'Int', defaultValue: 1 },
    },
    resolve: async rp => {
      // const res = await fetch(`https://swapi.co/api/${urlAddr}/?page=${rp.args.page}`);
      // const data = await res.json();
      // return data.results;
      return rp.context.loader.load(`https://swapi.co/api/${urlAddr}/?page=${rp.args.page}`);
    },
  });
}

export function createFindByUrlListResolver(tc: TypeComposer): void {
  tc.addResolver({
    name: 'findByUrlList',
    type: [tc],
    resolve: rp => {
      // return rp.args.urls.map(async url => {
      //   const res = await fetch(url);
      //   const data = await res.json();
      //   return data;
      // });
      return rp.context.loader.loadMany(rp.args.urls);
    },
  });
}
