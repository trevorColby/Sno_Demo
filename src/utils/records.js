import { Record, List } from 'immutable';

export const Trail = Record({
  id: null,
  name: null,
  features: [],
});

export const Hydrant = Record({
  id: null,
  name: null,
  elevation: null,
  trail: null,
  coords: [],
  feature: null,
});
