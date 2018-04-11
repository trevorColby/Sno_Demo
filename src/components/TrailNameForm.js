import React from 'react';

class TrailNameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.trailName };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.editTrail.focus();
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  handleSubmit() {
    const { trailName, onSubmit } = this.props;
    const { value } = this.state;
    if (value !== trailName) {
      onSubmit(value);
    }
  }

  render() {
    return (
      <form
        onSubmit={this.handleSubmit}
        onBlur={this.handleSubmit}
      >
        <input
          ref={(i) => { this.editTrail = i; }}
          type="text"
          onChange={this.handleChange}
          value={this.state.value}
          name="name"
        />
      </form>
    );
  }
}

export default TrailNameForm;
