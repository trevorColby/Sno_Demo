import React from 'react';
import Snackbar from 'material-ui/Snackbar';

class OperationMessage extends React.Component {

  state = {
    open: false
  }

  setOpen = (bool) => {
    this.setState({
      open: bool
    });
  }

  componentWillReceiveProps(next) {
    if (this.props.message !== next.message && next.message) {
      this.setState({
        open: true,
      });
    }
  }

  render() {
    const {  message, setMessageToNull } = this.props
    return (
      <Snackbar
        open={this.state.open}
        autoHideDuration={2000}
        message={message}
        onClose={()=> { setMessageToNull(); this.setState({ open: false})}}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left'}}
      />
    )
  }
}


export default OperationMessage;
