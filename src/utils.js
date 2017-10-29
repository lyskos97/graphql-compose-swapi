/* @flow */

import type { TypeComposer } from 'graphql-compose';

export function createFindByIdResolver(tc: TypeComposer, urlAddr: string): void {
  tc.addResolver({
    name: 'findById',
    type: tc,
    args: {
      id: 'Int!',
    },
    resolve: async rp => {
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
      return rp.context.loader.load(`https://swapi.co/api/${urlAddr}/?page=${rp.args.page}`);
    },
  });
}

export function createFindByUrlListResolver(tc: TypeComposer): void {
  tc.addResolver({
    name: 'findByUrlList',
    type: [tc],
    resolve: rp => {
      return rp.context.loader.loadMany(rp.args.urls);
    },
  });
}
