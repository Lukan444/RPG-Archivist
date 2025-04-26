import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress } from '@mui/material';
import { checkIfAppRunning, requestInstanceToClose, initInstanceManager } from '../../utils/instanceManager';

interface SingleInstanceCheckProps {
  onInstanceResolved: () => void;
}

const SingleInstanceCheck: React.FC<SingleInstanceCheckProps> = ({ onInstanceResolved }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [existingInstanceId, setExistingInstanceId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Initialize the instance manager
    const cleanup = initInstanceManager();

    const checkInstance = async () => {
      setIsChecking(true);
      const instanceId = await checkIfAppRunning();

      if (instanceId) {
        setExistingInstanceId(instanceId);
        setOpen(true);
      } else {
        onInstanceResolved();
      }

      setIsChecking(false);
    };

    checkInstance();

    // Clean up when component unmounts
    return cleanup;
  }, [onInstanceResolved]);

  const handleClose = () => {
    setOpen(false);
    onInstanceResolved();
  };

  const handleCloseExisting = async () => {
    if (!existingInstanceId) return;

    setIsClosing(true);
    requestInstanceToClose(existingInstanceId);

    // Wait a moment to give the other instance time to close
    setTimeout(() => {
      setOpen(false);
      onInstanceResolved();
      setIsClosing(false);
    }, 1000);
  };

  if (isChecking) {
    return (
      <Dialog open={true}>
        <DialogTitle>Checking Application Status</DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </DialogContent>
        <DialogContentText sx={{ px: 3, pb: 2, textAlign: 'center' }}>
          Checking if RPG Archivist is already running...
        </DialogContentText>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="instance-dialog-title"
      aria-describedby="instance-dialog-description"
    >
      <DialogTitle id="instance-dialog-title">
        RPG Archivist is Already Running
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="instance-dialog-description">
          Another instance of RPG Archivist is already running in another browser tab or window.
          Would you like to close the existing instance and continue with this one?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Continue Anyway
        </Button>
        <Button
          onClick={handleCloseExisting}
          color="secondary"
          variant="contained"
          disabled={isClosing}
          startIcon={isClosing ? <CircularProgress size={20} /> : null}
        >
          {isClosing ? 'Closing...' : 'Close Existing & Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SingleInstanceCheck;
