import React from 'react';

class TrailNameForm extends React.Component{

  constructor(props){
    super(props);
    this.state = {value: props.trailName}
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e){
    this.setState({
      value: e.target.value
    })


  }

  render(){
    const {renameTrail, trailId} = this.props;

    return(
      <form onBlur={()=>{ renameTrail(trailId, this.state.value) }} >
        <input type="text" onChange={this.handleChange} value={this.state.value} name="name" />
      </form>
    )
  }
}

export default TrailNameForm;
