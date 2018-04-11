import React from 'react';

class SideMenu extends React.Component {
  render(){
    const {mode} = this.props;
    const style = {
      height: '100%',
      overflowX: 'scroll',
      backgroundColor: 'rgba(232,232,232,.72)',
      position: 'absolute',
      zIndex: '99',
      top: '0',
    }

    return (
      <div style={style}>
        {mode !== 'trails' ? null : (
            <div>Add a trail</div>
        )}
        {this.props.children}
      </div>
    )
  }
}

export default SideMenu;
