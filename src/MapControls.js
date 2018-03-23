import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';

export class MapControls extends React.Component{

  constructor(props){
    super(props);
    this.handleClick = this.handleClick.bind(this)
  };

  handleClick(e){
    this.props.onClick(e.target.id)
  }

  render(){
    let style= {
      position: 'absolute',
      bottom: 0,
      left: 0,
      zIndex: 99
    }

    return (
      <div>
      <ButtonGroup style= {style} >
        <Button bsStyle="primary" id='Trail' onClick={this.handleClick}>Trail</Button>
        <Button bsStyle="primary" id='Hydrant' onClick={this.handleClick}>Hydrant</Button>
        <Button bsStyle="primary" id='HydrantLine' onClick={this.handleClick}>Hydrant Line</Button>
        <Button bsStyle="primary" id='HydrantTrail' onClick={this.handleClick}>Hydrant Trail</Button>
        <Button bsStyle="success" onClick={this.handleClick}>Save</Button>
      </ButtonGroup>
      </div>
    )
  }
}
