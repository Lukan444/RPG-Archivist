import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Divider, CircularProgress, Button, Chip, IconButton, Stack, TextField, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PersonOutlined, EditOutlined, SaveOutlined, CancelOutlined, ContentCopyOutlined, DownloadOutlined, AnalyticsOutlined } from '@mui/icons-material';
import AudioPlayer from './AudioPlayer';

interface TranscriptionSegment {
  segment_id: string;
  start_time: number;
  end_time: number;
  text: string;
  speaker_id?: string;
  speaker_name?: string;
  confidence_score: number;
}

interface Speaker {
  speaker_id: string;
  speaker_name: string;
  character_id?: string;
  user_id?: string;
}

interface Character {
  character_id: string;
  name: string;
}

interface User {
  user_id: string;
  username: string;
}

interface TranscriptionViewerProps {
  transcriptionId: string;
  recordingId: string;
  audioUrl: string;
  sessionId?: string;
  onError?: (error: string) => void;
  onAnalyzeClick?: (transcriptionId: string) => void;
}

const TranscriptionViewer: React.FC<TranscriptionViewerProps> = ({
  transcriptionId,
  recordingId,
  audioUrl,
  sessionId,
  onError,
  onAnalyzeClick
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [transcription, setTranscription] = useState<any>(null);
  const [currentSegmentId, setCurrentSegmentId] = useState<string | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [editedSpeakerName, setEditedSpeakerName] = useState('');
  const [editedCharacterId, setEditedCharacterId] = useState<string | null>(null);
  const [editedUserId, setEditedUserId] = useState<string | null>(null);
  const [savingSpeaker, setSavingSpeaker] = useState(false);
  const [showSpeakerDialog, setShowSpeakerDialog] = useState(false);
  const [newSpeakerName, setNewSpeakerName] = useState('');
  const [newSpeakerCharacterId, setNewSpeakerCharacterId] = useState<string | null>(null);
  const [newSpeakerUserId, setNewSpeakerUserId] = useState<string | null>(null);

  const segmentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch transcription data
  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/transcriptions/${transcriptionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch transcription');
        }

        const data = await response.json();

        if (data.success) {
          setTranscription(data.data);

          // Set initial segment if available
          if (data.data.segments && data.data.segments.length > 0) {
            setCurrentSegmentId(data.data.segments[0].segment_id);
          }
        } else {
          throw new Error(data.error?.message || 'Failed to fetch transcription');
        }
      } catch (error) {
        console.error('Error fetching transcription:', error);
        if (onError) {
          onError('Failed to load transcription. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchSpeakers = async () => {
      try {
        // Get session ID from transcription
        const transcriptionResponse = await fetch(`/api/transcriptions/${transcriptionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!transcriptionResponse.ok) {
          throw new Error('Failed to fetch transcription');
        }

        const transcriptionData = await transcriptionResponse.json();

        if (!transcriptionData.success) {
          throw new Error(transcriptionData.error?.message || 'Failed to fetch transcription');
        }

        const sessionId = transcriptionData.data.session_id;

        // Fetch speakers for session
        const speakersResponse = await fetch(`/api/transcriptions/session/${sessionId}/speakers`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!speakersResponse.ok) {
          throw new Error('Failed to fetch speakers');
        }

        const speakersData = await speakersResponse.json();

        if (speakersData.success) {
          setSpeakers(speakersData.data);
        } else {
          throw new Error(speakersData.error?.message || 'Failed to fetch speakers');
        }
      } catch (error) {
        console.error('Error fetching speakers:', error);
      }
    };

    const fetchCharacters = async () => {
      try {
        // Fetch characters for campaign
        const response = await fetch('/api/characters', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch characters');
        }

        const data = await response.json();

        if (data.success) {
          setCharacters(data.data.characters);
        } else {
          throw new Error(data.error?.message || 'Failed to fetch characters');
        }
      } catch (error) {
        console.error('Error fetching characters:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        // Fetch users
        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();

        if (data.success) {
          setUsers(data.data.users);
        } else {
          throw new Error(data.error?.message || 'Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchTranscription();
    fetchSpeakers();
    fetchCharacters();
    fetchUsers();
  }, [transcriptionId, onError]);

  // Scroll to segment when current segment changes
  useEffect(() => {
    if (currentSegmentId && segmentRefs.current[currentSegmentId]) {
      segmentRefs.current[currentSegmentId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentSegmentId]);

  // Handle segment change from audio player
  const handleSegmentChange = (segmentId: string) => {
    setCurrentSegmentId(segmentId);
  };

  // Handle segment click
  const handleSegmentClick = (segmentId: string) => {
    setCurrentSegmentId(segmentId);
  };

  // Start editing speaker
  const handleEditSpeaker = (speakerId: string) => {
    const speaker = speakers.find(s => s.speaker_id === speakerId);

    if (speaker) {
      setEditingSpeakerId(speakerId);
      setEditedSpeakerName(speaker.speaker_name);
      setEditedCharacterId(speaker.character_id || null);
      setEditedUserId(speaker.user_id || null);
    }
  };

  // Cancel editing speaker
  const handleCancelEditSpeaker = () => {
    setEditingSpeakerId(null);
    setEditedSpeakerName('');
    setEditedCharacterId(null);
    setEditedUserId(null);
  };

  // Save speaker changes
  const handleSaveSpeaker = async () => {
    if (!editingSpeakerId || !editedSpeakerName.trim()) return;

    try {
      setSavingSpeaker(true);

      const response = await fetch(`/api/transcriptions/speakers/${editingSpeakerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          speaker_name: editedSpeakerName.trim(),
          character_id: editedCharacterId,
          user_id: editedUserId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update speaker');
      }

      const data = await response.json();

      if (data.success) {
        // Update speakers list
        setSpeakers(prevSpeakers =>
          prevSpeakers.map(speaker =>
            speaker.speaker_id === editingSpeakerId
              ? {
                  ...speaker,
                  speaker_name: editedSpeakerName.trim(),
                  character_id: editedCharacterId || undefined,
                  user_id: editedUserId || undefined
                }
              : speaker
          )
        );

        // Update transcription segments
        if (transcription) {
          setTranscription({
            ...transcription,
            segments: transcription.segments.map((segment: TranscriptionSegment) =>
              segment.speaker_id === editingSpeakerId
                ? {
                    ...segment,
                    speaker_name: editedSpeakerName.trim()
                  }
                : segment
            )
          });
        }

        // Reset editing state
        setEditingSpeakerId(null);
        setEditedSpeakerName('');
        setEditedCharacterId(null);
        setEditedUserId(null);
      } else {
        throw new Error(data.error?.message || 'Failed to update speaker');
      }
    } catch (error) {
      console.error('Error updating speaker:', error);
      if (onError) {
        onError('Failed to update speaker. Please try again.');
      }
    } finally {
      setSavingSpeaker(false);
    }
  };

  // Open create speaker dialog
  const handleOpenSpeakerDialog = () => {
    setShowSpeakerDialog(true);
    setNewSpeakerName('');
    setNewSpeakerCharacterId(null);
    setNewSpeakerUserId(null);
  };

  // Close create speaker dialog
  const handleCloseSpeakerDialog = () => {
    setShowSpeakerDialog(false);
  };

  // Create new speaker
  const handleCreateSpeaker = async () => {
    if (!newSpeakerName.trim()) return;

    try {
      setSavingSpeaker(true);

      const response = await fetch('/api/transcriptions/speakers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newSpeakerName.trim(),
          character_id: newSpeakerCharacterId,
          user_id: newSpeakerUserId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create speaker');
      }

      const data = await response.json();

      if (data.success) {
        // Add new speaker to list
        setSpeakers(prevSpeakers => [...prevSpeakers, data.data]);

        // Close dialog
        setShowSpeakerDialog(false);
        setNewSpeakerName('');
        setNewSpeakerCharacterId(null);
        setNewSpeakerUserId(null);
      } else {
        throw new Error(data.error?.message || 'Failed to create speaker');
      }
    } catch (error) {
      console.error('Error creating speaker:', error);
      if (onError) {
        onError('Failed to create speaker. Please try again.');
      }
    } finally {
      setSavingSpeaker(false);
    }
  };

  // Copy transcription to clipboard
  const handleCopyTranscription = () => {
    if (!transcription) return;

    const text = transcription.full_text;

    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Transcription copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        if (onError) {
          onError('Failed to copy transcription. Please try again.');
        }
      });
  };

  // Download transcription as text file
  const handleDownloadTranscription = () => {
    if (!transcription) return;

    const text = transcription.segments
      .map((segment: TranscriptionSegment) =>
        `[${formatTime(segment.start_time)} - ${formatTime(segment.end_time)}]${segment.speaker_name ? ` ${segment.speaker_name}:` : ''} ${segment.text}`
      )
      .join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${recordingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get speaker color
  const getSpeakerColor = (speakerId?: string) => {
    if (!speakerId) return theme.palette.grey[500];

    // Generate a consistent color based on speaker ID
    const hash = speakerId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const h = Math.abs(hash) % 360;
    const s = 70;
    const l = 60;

    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!transcription) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body1" color="text.secondary">
          No transcription available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Audio Player */}
      <Box sx={{ mb: 3 }}>
        <AudioPlayer
          src={audioUrl}
          title={transcription.recording_name || 'Audio Recording'}
          segments={transcription.segments.map((segment: TranscriptionSegment) => ({
            id: segment.segment_id,
            startTime: segment.start_time,
            endTime: segment.end_time,
            text: segment.text,
            speakerName: segment.speaker_name
          }))}
          currentSegmentId={currentSegmentId || undefined}
          onSegmentChange={handleSegmentChange}
        />
      </Box>

      {/* Transcription Actions */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentCopyOutlined />}
            onClick={handleCopyTranscription}
          >
            Copy
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadOutlined />}
            onClick={handleDownloadTranscription}
          >
            Download
          </Button>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PersonOutlined />}
            onClick={handleOpenSpeakerDialog}
          >
            Add Speaker
          </Button>

          {onAnalyzeClick && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AnalyticsOutlined />}
              onClick={() => onAnalyzeClick(transcriptionId)}
            >
              AI Analysis
            </Button>
          )}
        </Stack>
      </Box>

      {/* Transcription Info */}
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Language:</strong> {transcription.language_code || 'Unknown'}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            <strong>Confidence:</strong> {Math.round(transcription.confidence_score * 100)}%
          </Typography>

          <Typography variant="body2" color="text.secondary">
            <strong>Word Count:</strong> {transcription.word_count || 0}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            <strong>Service:</strong> {transcription.service_used || 'Unknown'}
          </Typography>
        </Paper>
      </Box>

      {/* Transcription Segments */}
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Transcription
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {transcription.segments.map((segment: TranscriptionSegment, index: number) => (
            <Box
              key={segment.segment_id}
              ref={el => segmentRefs.current[segment.segment_id] = el as HTMLDivElement}
              sx={{
                p: 1.5,
                mb: 1,
                borderRadius: 1,
                backgroundColor: currentSegmentId === segment.segment_id ?
                  `${theme.palette.primary.main}10` :
                  'transparent',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: currentSegmentId === segment.segment_id ?
                    `${theme.palette.primary.main}20` :
                    `${theme.palette.action.hover}`
                },
                borderLeft: `3px solid ${
                  currentSegmentId === segment.segment_id ?
                    theme.palette.primary.main :
                    'transparent'
                }`
              }}
              onClick={() => handleSegmentClick(segment.segment_id)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(segment.start_time)} - {formatTime(segment.end_time)}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {Math.round(segment.confidence_score * 100)}% confidence
                </Typography>
              </Box>

              {segment.speaker_id && (
                <Box sx={{ mb: 1 }}>
                  {editingSpeakerId === segment.speaker_id ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        label="Speaker Name"
                        value={editedSpeakerName}
                        onChange={(e) => setEditedSpeakerName(e.target.value)}
                        sx={{ flexGrow: 1 }}
                      />

                      <IconButton
                        size="small"
                        color="primary"
                        onClick={handleSaveSpeaker}
                        disabled={savingSpeaker || !editedSpeakerName.trim()}
                      >
                        {savingSpeaker ? <CircularProgress size={20} /> : <SaveOutlined />}
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={handleCancelEditSpeaker}
                        disabled={savingSpeaker}
                      >
                        <CancelOutlined />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        label={segment.speaker_name || `Speaker ${index + 1}`}
                        size="small"
                        sx={{
                          backgroundColor: getSpeakerColor(segment.speaker_id),
                          color: theme.palette.getContrastText(getSpeakerColor(segment.speaker_id))
                        }}
                      />

                      <IconButton
                        size="small"
                        onClick={() => handleEditSpeaker(segment.speaker_id!)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {editingSpeakerId === segment.speaker_id && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Character</InputLabel>
                        <Select
                          value={editedCharacterId || ''}
                          label="Character"
                          onChange={(e) => setEditedCharacterId(e.target.value || null)}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {characters.map((character) => (
                            <MenuItem key={character.character_id} value={character.character_id}>
                              {character.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>User</InputLabel>
                        <Select
                          value={editedUserId || ''}
                          label="User"
                          onChange={(e) => setEditedUserId(e.target.value || null)}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {users.map((user) => (
                            <MenuItem key={user.user_id} value={user.user_id}>
                              {user.username}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Box>
              )}

              <Typography variant="body1">
                {segment.text}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Box>

      {/* Create Speaker Dialog */}
      <Dialog open={showSpeakerDialog} onClose={handleCloseSpeakerDialog}>
        <DialogTitle>Add New Speaker</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Speaker Name"
            fullWidth
            value={newSpeakerName}
            onChange={(e) => setNewSpeakerName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Character</InputLabel>
            <Select
              value={newSpeakerCharacterId || ''}
              label="Character"
              onChange={(e) => setNewSpeakerCharacterId(e.target.value || null)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {characters.map((character) => (
                <MenuItem key={character.character_id} value={character.character_id}>
                  {character.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense">
            <InputLabel>User</InputLabel>
            <Select
              value={newSpeakerUserId || ''}
              label="User"
              onChange={(e) => setNewSpeakerUserId(e.target.value || null)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.user_id} value={user.user_id}>
                  {user.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSpeakerDialog}>Cancel</Button>
          <Button
            onClick={handleCreateSpeaker}
            disabled={savingSpeaker || !newSpeakerName.trim()}
          >
            {savingSpeaker ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TranscriptionViewer;
