import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const RotationSlider = ({ rotation, onRotationChange }) => {
  const style = {
    position: 'absolute',
    bottom: '3em',
    width: 300,
    right: '3em',
  };
  return (
    <Slider
      railStyle={{ backgroundColor: '#1564c0' }}
      onChange={(r) => { onRotationChange(r); }}
      min={0}
      max={7}
      step={0.01}
    />
  );
};


export default RotationSlider;
