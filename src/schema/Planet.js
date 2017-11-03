/* @flow */

import fetch from 'node-fetch';
import composeWithJson from 'graphql-compose-json';
import {
  createFindByIdResolver,
  createFindListByPageNumberResolver,
  createFindByUrlListResolver,
} from '../utils';
import PersonTC from './Person';
import FilmTC from './Film';

const restApiResponse = {
  name: 'Alderaan',
  rotation_period: '24',
  orbital_period: '364',
  diameter: '12500',
  climate: 'temperate',
  gravity: '1 standard',
  terrain: 'grasslands, mountains',
  surface_water: '40',
  population: '2000000000',
  residents: [
    'https://swapi.co/api/people/5/',
    'https://swapi.co/api/people/68/',
    'https://swapi.co/api/people/81/',
  ],
  films: ['https://swapi.co/api/films/6/', 'https://swapi.co/api/films/1/'],
  created: '2014-12-10T11:35:48.479000Z',
  edited: '2014-12-20T20:58:18.420000Z',
  url: 'https://swapi.co/api/planets/2/',
};

const PlanetTC = composeWithJson('Planet', restApiResponse);

export default PlanetTC;

createFindByIdResolver(PlanetTC, 'planets');

createFindListByPageNumberResolver(PlanetTC, 'planets');

createFindByUrlListResolver(PlanetTC);

PlanetTC.addResolver({
  name: 'findByUrl',
  type: PlanetTC,
  resolve: async rp => {
    const res = await fetch(rp.args.url);
    const data = await res.json();
    return data;
  },
});

PlanetTC.addRelation('residents', {
  resolver: () => PersonTC.getResolver('findByUrlList'),
  prepareArgs: {
    urls: source => source.residents,
  },
});

PlanetTC.addRelation('films', {
  resolver: () => FilmTC.getResolver('findByUrlList'),
  prepareArgs: {
    urls: source => source.films,
  },
});
