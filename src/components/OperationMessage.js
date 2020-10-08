import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

class OperationMessage extends React.Component {
  state = {
    open: false,
  }

  componentWillReceiveProps(next) {
    if (this.props.message !== next.message && next.message) {
      this.setState({
        open: true,
      });
    }
  }

  setOpen = (bool) => {
    this.setState({
      open: bool,
    });
  }

  render() {
    const { message, setMessageToNull } = this.props;

    return (
      <Snackbar
        open={this.state.open}
        autoHideDuration={3000}
        message={message}
        onClose={() => { setMessageToNull(); this.setState({ open: false }); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    );
  }
}


export default OperationMessage;
