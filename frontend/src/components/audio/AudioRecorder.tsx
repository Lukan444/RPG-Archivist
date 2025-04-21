import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Slider, IconButton, Paper, Stack, TextField, FormControlLabel, Switch, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { MicOutlined, StopOutlined, PlayArrowOutlined, PauseOutlined, SaveOutlined, DeleteOutlined } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface AudioRecorderProps {
  sessionId: string;
  onRecordingComplete?: (recordingId: string) => void;
  onError?: (error: string) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  sessionId,
  onRecordingComplete,
  onError
}) => {
  const theme = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [recordingName, setRecordingName] = useState('');
  const [recordingDescription, setRecordingDescription] = useState('');
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [enableSpeakerDiarization, setEnableSpeakerDiarization] = useState(true);
  const [noiseReductionLevel, setNoiseReductionLevel] = useState('medium');
  const [transcriptionService, setTranscriptionService] = useState('hybrid');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('ended', handlePlaybackEnded);
    audioRef.current.addEventListener('loadedmetadata', handleMetadataLoaded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handlePlaybackEnded);
        audioRef.current.removeEventListener('loadedmetadata', handleMetadataLoaded);
      }
    };
  }, []);

  // Handle time update during playback
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setPlaybackTime(audioRef.current.currentTime);
    }
  };

  // Handle playback ended
  const handlePlaybackEnded = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  // Handle metadata loaded
  const handleMetadataLoaded = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset state
      audioChunksRef.current = [];
      setRecordingTime(0);
      setAudioBlob(null);
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Create audio URL for playback
        if (audioRef.current) {
          const audioUrl = URL.createObjectURL(audioBlob);
          audioRef.current.src = audioUrl;
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start(1000);
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      if (onError) {
        onError('Failed to access microphone. Please check your permissions.');
      }
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        // Resume recording
        mediaRecorderRef.current.resume();
        
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prevTime => prevTime + 1);
        }, 1000);
        
        setIsPaused(false);
      } else {
        // Pause recording
        mediaRecorderRef.current.pause();
        
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        setIsPaused(true);
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Toggle playback
  const togglePlayback = () => {
    if (!audioRef.current || !audioBlob) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle playback slider change
  const handlePlaybackSliderChange = (_event: Event, newValue: number | number[]) => {
    if (audioRef.current && typeof newValue === 'number') {
      audioRef.current.currentTime = newValue;
      setPlaybackTime(newValue);
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Save recording
  const saveRecording = async () => {
    if (!audioBlob) return;
    
    // Validate recording name
    if (!recordingName.trim()) {
      if (onError) {
        onError('Please enter a name for the recording.');
      }
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob, `${recordingName.trim()}.wav`);
      formData.append('sessionId', sessionId);
      formData.append('name', recordingName.trim());
      
      if (recordingDescription.trim()) {
        formData.append('description', recordingDescription.trim());
      }
      
      formData.append('autoTranscribe', String(autoTranscribe));
      formData.append('enableSpeakerDiarization', String(enableSpeakerDiarization));
      formData.append('noiseReductionLevel', noiseReductionLevel);
      formData.append('transcriptionService', transcriptionService);
      
      // Send request to API
      const response = await fetch('/api/audio-recordings/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // No Content-Type header, it will be set automatically with the boundary
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to save recording');
      }
      
      // Reset state
      setAudioBlob(null);
      setRecordingName('');
      setRecordingDescription('');
      setPlaybackTime(0);
      setAudioDuration(0);
      
      // Call callback
      if (onRecordingComplete) {
        onRecordingComplete(data.data.recording_id);
      }
    } catch (error) {
      console.error('Error saving recording:', error);
      if (onError) {
        onError('Failed to save recording. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Discard recording
  const discardRecording = () => {
    setAudioBlob(null);
    setRecordingName('');
    setRecordingDescription('');
    setPlaybackTime(0);
    setAudioDuration(0);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Typography variant="h6" gutterBottom>
        Audio Recorder
      </Typography>
      
      {/* Recording Controls */}
      {!audioBlob && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton 
              color={isRecording ? 'error' : 'primary'} 
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isSaving}
              sx={{ 
                width: 56, 
                height: 56,
                backgroundColor: isRecording ? 'rgba(244, 67, 54, 0.1)' : 'rgba(25, 118, 210, 0.1)'
              }}
            >
              {isRecording ? <StopOutlined /> : <MicOutlined />}
            </IconButton>
            
            {isRecording && (
              <IconButton 
                color="primary" 
                onClick={pauseRecording}
                disabled={isSaving}
              >
                {isPaused ? <PlayArrowOutlined /> : <PauseOutlined />}
              </IconButton>
            )}
            
            <Typography variant="body1">
              {formatTime(recordingTime)}
            </Typography>
            
            {isRecording && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress 
                  size={16} 
                  color="error" 
                  sx={{ 
                    mr: 1,
                    animation: isPaused ? 'none' : undefined,
                    opacity: isPaused ? 0.5 : 1
                  }} 
                />
                <Typography variant="body2" color="text.secondary">
                  {isPaused ? 'Paused' : 'Recording...'}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
      )}
      
      {/* Playback Controls */}
      {audioBlob && (
        <Box sx={{ mb: 3 }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton 
                color="primary" 
                onClick={togglePlayback}
                disabled={isSaving}
              >
                {isPlaying ? <PauseOutlined /> : <PlayArrowOutlined />}
              </IconButton>
              
              <Typography variant="body2">
                {formatTime(playbackTime)}
              </Typography>
              
              <Slider
                value={playbackTime}
                max={audioDuration || 100}
                onChange={handlePlaybackSliderChange}
                disabled={isSaving}
                sx={{ flexGrow: 1 }}
              />
              
              <Typography variant="body2">
                {formatTime(audioDuration)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      )}
      
      {/* Recording Details */}
      {audioBlob && (
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Recording Name"
            value={recordingName}
            onChange={(e) => setRecordingName(e.target.value)}
            fullWidth
            margin="normal"
            disabled={isSaving}
            required
          />
          
          <TextField
            label="Description (Optional)"
            value={recordingDescription}
            onChange={(e) => setRecordingDescription(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={2}
            disabled={isSaving}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={autoTranscribe}
                onChange={(e) => setAutoTranscribe(e.target.checked)}
                disabled={isSaving}
              />
            }
            label="Auto-transcribe"
            sx={{ mt: 2 }}
          />
          
          {autoTranscribe && (
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={enableSpeakerDiarization}
                    onChange={(e) => setEnableSpeakerDiarization(e.target.checked)}
                    disabled={isSaving}
                  />
                }
                label="Enable Speaker Identification"
              />
              
              <FormControl fullWidth margin="normal" disabled={isSaving}>
                <InputLabel>Transcription Service</InputLabel>
                <Select
                  value={transcriptionService}
                  onChange={(e) => setTranscriptionService(e.target.value)}
                  label="Transcription Service"
                >
                  <MenuItem value="openai_whisper">OpenAI Whisper (Cloud)</MenuItem>
                  <MenuItem value="vosk">Vosk (Offline)</MenuItem>
                  <MenuItem value="hybrid">Hybrid (Recommended)</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal" disabled={isSaving}>
                <InputLabel>Noise Reduction</InputLabel>
                <Select
                  value={noiseReductionLevel}
                  onChange={(e) => setNoiseReductionLevel(e.target.value)}
                  label="Noise Reduction"
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      )}
      
      {/* Action Buttons */}
      {audioBlob && (
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlined />}
            onClick={discardRecording}
            disabled={isSaving}
          >
            Discard
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
            onClick={saveRecording}
            disabled={isSaving || !recordingName.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Recording'}
          </Button>
        </Stack>
      )}
    </Paper>
  );
};

export default AudioRecorder;
