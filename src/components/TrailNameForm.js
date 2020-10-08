import React from 'react';
import { Input } from '@material-ui/core/';

class TrailNameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.trailName };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  handleSubmit(e) {
    const { trailName, onSubmit } = this.props;
    const { value } = this.state;
    e.preventDefault();
    if (value !== trailName) {
      onSubmit(value);
    }
  }

  render() {
    return (
      <Input
        type="text"
        onChange={this.handleChange}
        value={this.state.value}
        onBlur={this.handleSubmit}
      />
    );
  }
}

export default TrailNameForm;
