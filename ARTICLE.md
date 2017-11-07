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
* Reducing Data Loading***

---

## Type Creation

The key feature of graphql-compose-json is it’s composeWithJson function which accepts JSON as argument and returns a TypeComposer which holds GrahpQLObjectType in getType() method.
Furthermore, you can specify fields directly in your JSON via arrow function (see mass and starships_count field):

## Data Fetching

graphql-compose-json allows you to define fetch methods yourself and doesn’t force you to use graphql-compose toolkit — you’re free to write with vanilla GraphQL Schema definition:
Relating Types

## Building Schema

## Reducing Data Loading