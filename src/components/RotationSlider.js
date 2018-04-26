import React from 'react';
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

const RotationSlider = ({rotation, onRotationChange}) => {

  const style = {
    position: 'absolute',
    bottom: '3em',
    width: 300,
    right: '3em',
  }
  return (
    <Slider
      value={rotation}
      style={style}
      onChange={(r)=> {onRotationChange(r)}}
      min={0}
      max={7}
      step={.01}
     />
  )
}


export default RotationSlider
