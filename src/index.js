/* @flow */

import express from 'express';
import graphqlHTTP from 'express-graphql';
import fetch from 'node-fetch';
import Dataloader from 'dataloader';
import schema from './schema/Schema';

const port = process.env.PORT || 3000;
const app = express();

async function loadData(url: string) {
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.count && data.results) {
    return data.results;
  }
  return data;
}

app.use(
  '/',
  graphqlHTTP(() => {
    const loader = new Dataloader(keys => Promise.all(keys.map(loadData)));

    return {
      schema,
      graphiql: true,
      context: {
        loader,
      },
    };
  })
);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
  console.log(`Visit http://localhost:${port}`);
});
