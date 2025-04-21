import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, IconButton, Divider, Chip, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { AudioFileOutlined, DeleteOutlined, PlayArrowOutlined, TranscribeOutlined, DownloadOutlined, AnalyticsOutlined } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import AudioPlayer from './AudioPlayer';
import TranscriptionViewer from './TranscriptionViewer';

interface AudioRecording {
  recording_id: string;
  name: string;
  description?: string;
  file_path: string;
  duration_seconds: number;
  file_size_bytes: number;
  file_format: string;
  created_at: string;
  transcription_status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  transcription_id?: string;
}

interface AudioRecordingsListProps {
  sessionId: string;
  onError?: (error: string) => void;
  onAnalyzeClick?: (transcriptionId: string, sessionId: string) => void;
}

const AudioRecordingsList: React.FC<AudioRecordingsListProps> = ({
  sessionId,
  onError,
  onAnalyzeClick
}) => {
  const theme = useTheme();
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordingToDelete, setRecordingToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  // Fetch recordings
  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/audio-recordings/session/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recordings');
        }

        const data = await response.json();

        if (data.success) {
          setRecordings(data.data.recordings);
        } else {
          throw new Error(data.error?.message || 'Failed to fetch recordings');
        }
      } catch (error) {
        console.error('Error fetching recordings:', error);
        if (onError) {
          onError('Failed to load recordings. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecordings();

    // Poll for transcription status updates
    const intervalId = setInterval(() => {
      fetchRecordings();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, [sessionId, onError]);

  // Get selected recording
  const getSelectedRecording = () => {
    return recordings.find(recording => recording.recording_id === selectedRecordingId) || null;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle recording click
  const handleRecordingClick = (recordingId: string) => {
    setSelectedRecordingId(recordingId);
    setShowPlayer(true);
    setShowTranscription(false);
  };

  // Handle transcription click
  const handleTranscriptionClick = (recordingId: string) => {
    setSelectedRecordingId(recordingId);
    setShowPlayer(false);
    setShowTranscription(true);
  };

  // Handle delete click
  const handleDeleteClick = (recordingId: string) => {
    setRecordingToDelete(recordingId);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!recordingToDelete) return;

    try {
      setDeleting(true);

      const response = await fetch(`/api/audio-recordings/${recordingToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete recording');
      }

      const data = await response.json();

      if (data.success) {
        // Remove from list
        setRecordings(prevRecordings =>
          prevRecordings.filter(recording => recording.recording_id !== recordingToDelete)
        );

        // Reset selected recording if it was deleted
        if (selectedRecordingId === recordingToDelete) {
          setSelectedRecordingId(null);
          setShowPlayer(false);
          setShowTranscription(false);
        }
      } else {
        throw new Error(data.error?.message || 'Failed to delete recording');
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
      if (onError) {
        onError('Failed to delete recording. Please try again.');
      }
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setRecordingToDelete(null);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRecordingToDelete(null);
  };

  // Handle start transcription
  const handleStartTranscription = async (recordingId: string) => {
    try {
      setTranscribing(true);

      const response = await fetch(`/api/audio-recordings/${recordingId}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          enableSpeakerDiarization: true,
          transcriptionService: 'hybrid'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start transcription');
      }

      const data = await response.json();

      if (data.success) {
        // Update recording status
        setRecordings(prevRecordings =>
          prevRecordings.map(recording =>
            recording.recording_id === recordingId
              ? {
                  ...recording,
                  transcription_status: 'in_progress',
                  transcription_id: data.data.transcription_id
                }
              : recording
          )
        );
      } else {
        throw new Error(data.error?.message || 'Failed to start transcription');
      }
    } catch (error) {
      console.error('Error starting transcription:', error);
      if (onError) {
        onError('Failed to start transcription. Please try again.');
      }
    } finally {
      setTranscribing(false);
    }
  };

  // Handle download recording
  const handleDownloadRecording = (recordingId: string) => {
    const recording = recordings.find(r => r.recording_id === recordingId);
    if (!recording) return;

    // Create a link to download the file
    const link = document.createElement('a');
    link.href = `/api/audio-recordings/${recordingId}/download`;
    link.download = `${recording.name}.${recording.file_format}`;
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');

    // Add authorization header
    const token = localStorage.getItem('token');
    if (token) {
      link.setAttribute('data-auth', `Bearer ${token}`);
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get transcription status chip
  const getTranscriptionStatusChip = (status: string) => {
    switch (status) {
      case 'not_started':
        return (
          <Chip
            label="Not Transcribed"
            size="small"
            sx={{ backgroundColor: theme.palette.grey[300], color: theme.palette.text.primary }}
          />
        );
      case 'in_progress':
        return (
          <Chip
            label="Transcribing..."
            size="small"
            sx={{ backgroundColor: theme.palette.warning.light, color: theme.palette.warning.contrastText }}
            icon={<CircularProgress size={12} color="inherit" />}
          />
        );
      case 'completed':
        return (
          <Chip
            label="Transcribed"
            size="small"
            sx={{ backgroundColor: theme.palette.success.light, color: theme.palette.success.contrastText }}
          />
        );
      case 'failed':
        return (
          <Chip
            label="Failed"
            size="small"
            sx={{ backgroundColor: theme.palette.error.light, color: theme.palette.error.contrastText }}
          />
        );
      default:
        return null;
    }
  };

  if (loading && recordings.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (recordings.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          No audio recordings found for this session.
        </Typography>
      </Paper>
    );
  }

  const selectedRecording = getSelectedRecording();

  return (
    <Box>
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {recordings.map((recording, index) => (
            <React.Fragment key={recording.recording_id}>
              {index > 0 && <Divider component="li" />}
              <ListItem
                button
                onClick={() => handleRecordingClick(recording.recording_id)}
                selected={selectedRecordingId === recording.recording_id && showPlayer}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.main}10`,
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: `${theme.palette.primary.main}20`,
                  }
                }}
              >
                <ListItemIcon>
                  <AudioFileOutlined />
                </ListItemIcon>
                <ListItemText
                  primary={recording.name}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {formatDuration(recording.duration_seconds)} • {formatFileSize(recording.file_size_bytes)}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {formatDate(recording.created_at)}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {getTranscriptionStatusChip(recording.transcription_status)}
                      </Box>
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadRecording(recording.recording_id);
                    }}
                  >
                    <DownloadOutlined />
                  </IconButton>

                  {recording.transcription_status === 'completed' && (
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTranscriptionClick(recording.recording_id);
                      }}
                      color={selectedRecordingId === recording.recording_id && showTranscription ? 'primary' : 'default'}
                    >
                      <TranscribeOutlined />
                    </IconButton>
                  )}

                  {recording.transcription_status === 'not_started' && (
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTranscription(recording.recording_id);
                      }}
                      disabled={transcribing}
                    >
                      <TranscribeOutlined />
                    </IconButton>
                  )}

                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(recording.recording_id);
                    }}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Audio Player */}
      {selectedRecording && showPlayer && (
        <Box sx={{ mt: 3 }}>
          <AudioPlayer
            src={`/api/audio-recordings/${selectedRecording.recording_id}/stream`}
            title={selectedRecording.name}
          />
        </Box>
      )}

      {/* Transcription Viewer */}
      {selectedRecording && showTranscription && selectedRecording.transcription_id && (
        <Box sx={{ mt: 3 }}>
          <TranscriptionViewer
            transcriptionId={selectedRecording.transcription_id}
            recordingId={selectedRecording.recording_id}
            audioUrl={`/api/audio-recordings/${selectedRecording.recording_id}/stream`}
            sessionId={sessionId}
            onError={onError}
            onAnalyzeClick={onAnalyzeClick ? (transcriptionId) => onAnalyzeClick(transcriptionId, sessionId) : undefined}
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Recording</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this recording? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AudioRecordingsList;
