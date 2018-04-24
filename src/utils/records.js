import { Record, List } from 'immutable';

export const Trail = Record({
  id: null,
  name: null,
  features: [],
  fillColor: '255,255,255',
});

export const Hydrant = Record({
  id: null,
  name: null,
  elevation: null,
  trail: null,
  coords: [],
  feature: null,
});
