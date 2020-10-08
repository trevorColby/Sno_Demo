import React from 'react';
import _ from 'lodash';
import axios from 'axios';
import ReactDOM from 'react-dom';
import { Async } from 'react-select';

const params = {
  format: 'json',
  addressdetails: 1,
  limit: 10,
  countrycodes: '',
  'accept-language': 'en-us',
};

class Geocoder extends React.Component {
  debouncedGetOptions = _.debounce((input, callback) => {
    params.q = input;
    axios.get('https://nominatim.openstreetmap.org/search/', { params })
      .then(resp => callback(null, {
        options: _.map(resp.data, d => ({
          value: `${d.lon},${d.lat}`,
          label: d.display_name,
        })),
      }));
  }, 250);

  handleChange = (option) => {
    const { locationSelected } = this.props;
    const coords = _.map(option.value.split(','), p => parseFloat((p)));
    locationSelected(coords);
  }

  render() {
    return (
      <Async
        loadOptions={this.debouncedGetOptions}
        onChange={this.handleChange}
      />
    );
  }
}

function createGeocoder(id, onSelect) {
  ReactDOM.render(
    <Geocoder locationSelected={onSelect} />,
    document.getElementById(id),
  );
}

export default createGeocoder;
