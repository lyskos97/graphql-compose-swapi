/* @flow */

import express from 'express';
import expressGraphQL from 'express-graphql';
import schema from './schema/Schema';

const port = process.env.PORT || 3000;
const app = express();

app.use(
  '/',
  expressGraphQL(req => ({
    schema,
    graphiql: true,
    context: req,
  }))
);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
  console.log(`Visit http://localhost:${port}/graphql`);
});
