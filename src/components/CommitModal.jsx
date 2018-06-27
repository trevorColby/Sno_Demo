import React from "react";
import Dialog, { DialogTitle, DialogContent, DialogContentText, DialogActions } from 'material-ui/Dialog';
import {Button} from 'material-ui';
import OperationMessage from './OperationMessage';
import {iSnoApp} from "./../utils/api";

class CommitModal extends React.Component{

  state={
    message: null
  }

  confirmChanges = () => {
    const {setCommitOpen, trails, hydrants} = this.props

    const newTrails = trails.toJS()

    iSnoApp.commitChanges("newTrails")
    .then(console.log)
    .catch(console.log)

    // this.setState({message:"Changes Saved To Database"})
    //
    // setCommitOpen(false)
  }

  render(){
    const { commitOpen, trails, hydrants, setCommitOpen } = this.props
    const { message } = this.state;
    return (
      <div>
        <Dialog
        onBackdropClick={()=> {setCommitOpen(false)}}
        open={commitOpen}
        >
        <DialogTitle>{"Confirm Save Changes To Database"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Confirm Save Changes
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
          onClick={this.confirmChanges}
          >
            Confirm
          </Button>

          <Button
          onClick={()=> setCommitOpen(false)}
          >
            Cancel
          </Button>

        </DialogActions>
        </Dialog>

        <OperationMessage
          setMessageToNull={() => { this.setState({ message: null }); }}
          message={message}
         />

      </div>

    )
  }
}

export default CommitModal
