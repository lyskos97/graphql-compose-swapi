# Building GraphQL Schema from REST API

Many developers get attracted by GraphQL’s benefits over REST which is the current market standard. GraphQL shines with the ability to request only that data fields that you need. While typical REST APIs require loading from multiple URLs, GraphQL APIs get all the data your app needs in a single request.

In some cases, you may want to wrap a REST API in your GraphQL Schema and it may require some tedious work to describe GraphQL Types manually.

So we came up with an idea of wrapping mature RESTful APIs in GraphQL with automated GQL types generation. The concept is simple: we pass a JSON response from REST API into some function which determines types of its fields and returns a GraphQL Type that we can further modify and use in our Schema.

The idea has resulted in a package graphql-compose-json(link: <https://github.com/graphql-compose/graphql-compose-json> ). We’d tried to wrap SWAPI REST API using this package and found it super convenient.

Our demo code can be found in this repo:

<https://github.com/lyskos97/graphql-compose-swapi>

and resulting LIVE DEMO here:

<https://graphql-compose-swapi.herokuapp.com>

![image](https://user-images.githubusercontent.com/23356069/32497421-b20e8214-c3f6-11e7-903d-b90d49ad11ed.png)

---

## Content

* Type Creation
* Data Fetching
* Relating Types
* Building Schema
* Reducing requests

---

## Type Creation

The key feature of `graphql-compose-json` is it’s `composeWithJson` function which accepts JSON as argument and returns a `TypeComposer` which holds `GrahpQLObjectType` in getType() method.

```js
// person.js

import composeWithJson from 'graphql-compose-json';

const restApiResponse = {
  name: 'Anakin Skywalker',
  birth_year: '41.9BBY',
  gender: 'male',
  mass: 77,
  homeworld: 'https://swapi.co/api/planets/1/',
  films: [
    'https://swapi.co/api/films/5/',
    'https://swapi.co/api/films/4/',
    'https://swapi.co/api/films/6/',
  ],
  species: ['https://swapi.co/api/species/1/'],
  starships: [
    'https://swapi.co/api/starships/59/',
    'https://swapi.co/api/starships/65/',
    'https://swapi.co/api/starships/39/',
  ],
};

export const PersonTC = composeWithJson('Person', restApiResponse);
export const PersonGraphQLType = PersonTC.getType();
```

You can additionally define fields directly in your JSON  using arrow functions (see mass and starships_count field):

```js
import composeWithJson from 'graphql-compose-json';

const restApiResponse = {
  name: 'Anakin Skywalker',
  birth_year: '41.9BBY',
  starships: [
    'https://swapi.co/api/starships/59/',
    'https://swapi.co/api/starships/65/',
    'https://swapi.co/api/starships/39/',
  ],
  mass: () => 'Int!', // by default JSON numbers coerced to Float, here we set up Int
  starships_count: () => ({ // more granular field config with resolve function
    type: 'Int',
    resolve: source => source.starships.length,
  }),
};

export const CustomPersonTC = composeWithJson('CustomPerson', restApiResponse);
export const CustomPersonGraphQLType = CustomPersonTC.getType();
```

Arrow functions should return Field Config (type, args and resolve) or a sole type. In fact, you may pass type as a string (`‘Int’`, `‘Float’`, `‘String’`, `‘Boolean’`, `‘ID’`, `‘Date’`, `‘JSON’`) or a SDL string (`‘ID!’` equals to `new GraphQLNonNull(GraphQLID)`, `'[ID!]'` equals to `new GraphQLList(new GraphQLNonNull(GraphQLID))`).

Furthermore, you may shorten this:

```js
GraphQLObjectType({
  name: ‘MyRange’,
  fields: {
    min: { type: GraphQLInt },
    max: { type: GraphQLInt }
  }
})
```

up to this:

```js
'type MyRange { min: Int, max: Int}'
```

Quite handy, isn’t it?

## Data Fetching

`graphql-compose-json` allows you to define fetch methods yourself and doesn’t force you to use `graphql-compose` toolkit — you’re free to write with vanilla `GraphQL` Schema definition:

```js
person: {
  type: PersonGraphQLType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
  },
  resolve: async (_, args) => {
    const res = await fetch(`https://swapi.co/api/people/${args.id}/`);
    const person = await res.json();
    return person;
  },
};
```

## Relating Types

### Using vanilla GraphQL

```js
const PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: () => ({
    films: {
      type: new GraphQLList(FilmType),
      resolve: source => {
        return Promise.all(source.films.map(async filmUrl => {
          const res = await fetch(filmUrl);
          const film = await res.json();
          return film;
        }));
      },
    },
  }),
});
```

### Using `graphql-compose`

You can use methods of `TypeComposer` as well. It allows you to pass pre-defined resolvers of other Types to your response object and create relations between your Types:

```js
// Person.js

PersonTC.addRelation('films', {
  resolver: () => FilmTC.getResolver('findByUrlList'),
  prepareArgs: {
    urls: source => source.films,
  },
});
```

Whereas `findByUrlList` resolver is defined in `Film.js`:

```js
// Film.js

FilmTC.addResolver({
    name: 'findByUrlList',
    type: [FilmTC],
    resolve: rp => { // `rp` stands for resolve params = { source, args, context, info }
        return Promise.all(rp.args.films.map(async filmUrl => {
          const res = await fetch(filmUrl);
          const film = await res.json();
          return film;
        }));
      },
  });
```

`findByUrlList` is can be reused in any other relation to fetch arrays of films.

## Building Schema

### Vanilla GraphQL

```js
// schema.js
import { GraphQLSchema, GraphQLObjectType, GraphQLNonNull, GraphQLInt } from 'graphql';
import fetch from 'node-fetch';
import { PersonGraphQLType } from './Person';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => {
      person: {
        type: PersonGraphQLType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLInt),
          }
        },
        resolve: async (_, args) => {
          const res = await fetch(`https://swapi.co/api/people/${args.id}/`);
          const person = await res.json();
          return person;
        },
      },
    },
  }),
});
```

### `graphql-compose`

```js
import { GQC } from 'graphql-compose';
import fetch from 'node-fetch';
import { PersonGraphQLType } from './Person';

GQC.rootQuery().addFields({
  person: {
    type: PersonTC,
    args: {
      id: `Int!`, // equals to `new GraphQLNonNull(GraphQLInt)`
    },
    resolve: async (_, args) => {
      const res = await fetch(`https://swapi.co/api/people/${args.id}/`);
      const person = await res.json();
      return person;
    },
  },
}

const schema = GQC.buildSchema(); // returns `GraphQLSchema`
```

## Reducing requests

It often happens that when we make nested data some resouces are requested several times within a single query. We surely do not want our app to re-iterate requests of the same data and show itself down impairing user exprerience. That's when [Facebook dataloader](https://github.com/facebook/dataloader)'s caching feature is of use.

Simply create an instance of `Dataloader` alongside with your `express` setup. The reason for such placement is the scope of caching: we want `dataloader` to cache requests within a single `GraphQL` query only.

Pass the `Dataloader` instance to the `context` field of `graphqlHTTP` to make your loader accessible all across the Schema.

```js
// index.js | express app

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
```

`dataloader` is really to use:

```js
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => {
      person: {
        type: PersonGraphQLType,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLInt),
          }
        },
        resolve: async (_, args, context) => context.loader.load(`https://swapi.co/api/people/${args.id}/`),
      },
    },
  }),
});
```

P.S. `dataloader` also has an awesome function of query batching, we suggest you to check it out.

---

## What we've got so far

We’ve started with bare JSON-response from RESTful API and ended up building a Schema with the Type generated by `graphql-compose-json`. Type we got is easily manageable and scalable as well as the resulting Schema: we may tune them with custom fields, custom fetching methods and relations with other Types.

---

`graphql-compose-json` repo:

<https://github.com/graphql-compose/graphql-compose-json>

Live demo:

<https://graphql-compose-swapi.herokuapp.com>

Shoutout to my colleague & co-author of this article @FrankAst and our mentor @nodkz, creator of [graphql-compose](https://github.com/nodkz/graphql-compose).
