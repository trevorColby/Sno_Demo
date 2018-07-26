import React from "react";
import Dialog, { DialogTitle, DialogContent, DialogContentText, DialogActions } from 'material-ui/Dialog';
import {Button, CircularProgress} from 'material-ui';
import OperationMessage from './OperationMessage';
import {iSnoApp} from "./../utils/api";
import _ from 'lodash';
import {createKML} from './../utils/processKML.js';

class CommitModal extends React.Component{

  state={
    message: null, 
    isSaving: false
  }

  confirmChanges = () => {
    const {setCommitOpen, trails, hydrants} = this.props

    const jsTrails = trails.toJS();
    const jsHydrants = hydrants.toJS();

    // Remove Open Layers Features since they create circular JSON references
    // When parsed into JSON
    const trailData = _.map(jsTrails, t => _.omit(t, ['features']) )
    const hydrantData = _.map(jsHydrants, h => _.omit(h, ['feature']))
    this.setState({isSaving: true})
    //commit Changes to database, then write and send new kmls to iSnoApp
    iSnoApp.commitChanges({trails: trailData, hydrants: hydrantData})
      .then(() => createKML({trails, hydrants}))
      .then((kmlData) => {
        const kmls = {};
        kmls.trails = kmlData[0];
        kmls.hydrants = kmlData[1];
        return iSnoApp.postKMLs(kmls);
      })
      .then(() => {
        this.setState({message:"Changes Saved To Database, reloading...", isSaving: false});
        setCommitOpen(false);
        setTimeout(() => window.location.reload(true), 2000);
      })
      .catch(() => {
        console.log("error in the saving");
        this.setState({message: "Save failed, try reloading the page or contacting Snomatic", isSaving: false});
      })
  }

  render(){
    const { commitOpen, trails, hydrants, setCommitOpen } = this.props
    const { message, isSaving } = this.state;
    return (
      <div>
        <Dialog
          onBackdropClick={()=> {setCommitOpen(false)}}
          open={commitOpen}
        >
        {isSaving ? (
          <CircularProgress style={{position: "absolute", top: "50%", left: "50%"}} />) : null}
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
