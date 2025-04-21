import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Slider, Typography, Paper, Stack, Tooltip } from '@mui/material';
import { PlayArrowOutlined, PauseOutlined, SkipPreviousOutlined, SkipNextOutlined, VolumeUpOutlined, VolumeOffOutlined, SpeedOutlined } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface AudioPlayerProps {
  src: string;
  title?: string;
  showTitle?: boolean;
  compact?: boolean;
  onEnded?: () => void;
  segments?: {
    id: string;
    startTime: number;
    endTime: number;
    text: string;
    speakerName?: string;
  }[];
  currentSegmentId?: string;
  onSegmentChange?: (segmentId: string) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  showTitle = true,
  compact = false,
  onEnded,
  segments = [],
  currentSegmentId,
  onSegmentChange
}) => {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [prevVolume, setPrevVolume] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.preload = 'metadata';
      
      // Add event listeners
      audioRef.current.addEventListener('loadedmetadata', handleMetadataLoaded);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('error', handleError);
    } else {
      audioRef.current.src = src;
    }
    
    // Reset state
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadedmetadata', handleMetadataLoaded);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
      }
    };
  }, [src]);

  // Update volume and playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, isMuted, playbackRate]);

  // Handle metadata loaded
  const handleMetadataLoaded = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle ended
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (onEnded) {
      onEnded();
    }
  };

  // Handle error
  const handleError = (error: Event) => {
    console.error('Audio error:', error);
    setIsPlaying(false);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      audioRef.current.play();
      animationRef.current = requestAnimationFrame(updateProgress);
    }
    
    setIsPlaying(!isPlaying);
  };

  // Update progress
  const updateProgress = () => {
    if (!audioRef.current) return;
    
    setCurrentTime(audioRef.current.currentTime);
    
    // Check if current time is within a segment
    if (segments.length > 0 && onSegmentChange) {
      const currentSegment = segments.find(
        segment => audioRef.current!.currentTime >= segment.startTime && 
                  audioRef.current!.currentTime <= segment.endTime
      );
      
      if (currentSegment && currentSegment.id !== currentSegmentId) {
        onSegmentChange(currentSegment.id);
      }
    }
    
    animationRef.current = requestAnimationFrame(updateProgress);
  };

  // Handle slider change
  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    if (!audioRef.current || typeof newValue !== 'number') return;
    
    audioRef.current.currentTime = newValue;
    setCurrentTime(newValue);
    
    // If not playing, update progress once
    if (!isPlaying) {
      // Check if current time is within a segment
      if (segments.length > 0 && onSegmentChange) {
        const currentSegment = segments.find(
          segment => newValue >= segment.startTime && newValue <= segment.endTime
        );
        
        if (currentSegment && currentSegment.id !== currentSegmentId) {
          onSegmentChange(currentSegment.id);
        }
      }
    }
  };

  // Handle volume change
  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue !== 'number') return;
    
    setVolume(newValue);
    setIsMuted(newValue === 0);
    
    if (audioRef.current) {
      audioRef.current.volume = newValue;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume);
      
      if (audioRef.current) {
        audioRef.current.volume = prevVolume;
      }
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  };

  // Change playback rate
  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
    
    if (audioRef.current) {
      audioRef.current.playbackRate = rates[nextIndex];
    }
  };

  // Skip to previous segment
  const skipToPreviousSegment = () => {
    if (!audioRef.current || segments.length === 0) return;
    
    const currentSegmentIndex = segments.findIndex(segment => segment.id === currentSegmentId);
    
    if (currentSegmentIndex > 0) {
      const previousSegment = segments[currentSegmentIndex - 1];
      audioRef.current.currentTime = previousSegment.startTime;
      setCurrentTime(previousSegment.startTime);
      
      if (onSegmentChange) {
        onSegmentChange(previousSegment.id);
      }
    } else {
      // If at first segment or no current segment, go to beginning
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      
      if (onSegmentChange && segments.length > 0) {
        onSegmentChange(segments[0].id);
      }
    }
  };

  // Skip to next segment
  const skipToNextSegment = () => {
    if (!audioRef.current || segments.length === 0) return;
    
    const currentSegmentIndex = segments.findIndex(segment => segment.id === currentSegmentId);
    
    if (currentSegmentIndex >= 0 && currentSegmentIndex < segments.length - 1) {
      const nextSegment = segments[currentSegmentIndex + 1];
      audioRef.current.currentTime = nextSegment.startTime;
      setCurrentTime(nextSegment.startTime);
      
      if (onSegmentChange) {
        onSegmentChange(nextSegment.id);
      }
    }
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Paper 
      elevation={compact ? 0 : 2} 
      sx={{ 
        p: compact ? 1 : 2, 
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper
      }}
    >
      {showTitle && title && (
        <Typography 
          variant={compact ? 'body2' : 'body1'} 
          fontWeight="medium" 
          gutterBottom
          noWrap
        >
          {title}
        </Typography>
      )}
      
      <Box sx={{ width: '100%' }}>
        {/* Main Controls */}
        <Stack 
          direction="row" 
          spacing={1} 
          alignItems="center" 
          sx={{ mb: compact ? 0.5 : 1 }}
        >
          {segments.length > 0 && (
            <IconButton 
              size={compact ? 'small' : 'medium'} 
              onClick={skipToPreviousSegment}
            >
              <SkipPreviousOutlined fontSize={compact ? 'small' : 'medium'} />
            </IconButton>
          )}
          
          <IconButton 
            color="primary" 
            onClick={togglePlayPause}
            size={compact ? 'small' : 'medium'}
          >
            {isPlaying ? 
              <PauseOutlined fontSize={compact ? 'small' : 'medium'} /> : 
              <PlayArrowOutlined fontSize={compact ? 'small' : 'medium'} />
            }
          </IconButton>
          
          {segments.length > 0 && (
            <IconButton 
              size={compact ? 'small' : 'medium'} 
              onClick={skipToNextSegment}
            >
              <SkipNextOutlined fontSize={compact ? 'small' : 'medium'} />
            </IconButton>
          )}
          
          <Typography variant={compact ? 'caption' : 'body2'} sx={{ minWidth: compact ? 45 : 60 }}>
            {formatTime(currentTime)}
          </Typography>
          
          <Slider
            value={currentTime}
            max={duration || 100}
            onChange={handleSliderChange}
            size={compact ? 'small' : 'medium'}
            sx={{ mx: 1 }}
          />
          
          <Typography variant={compact ? 'caption' : 'body2'} sx={{ minWidth: compact ? 45 : 60 }}>
            {formatTime(duration)}
          </Typography>
        </Stack>
        
        {/* Additional Controls */}
        {!compact && (
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            <Tooltip title={`Speed: ${playbackRate}x`}>
              <IconButton size="small" onClick={changePlaybackRate}>
                <SpeedOutlined fontSize="small" />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  {playbackRate}x
                </Typography>
              </IconButton>
            </Tooltip>
            
            <IconButton size="small" onClick={toggleMute}>
              {isMuted ? <VolumeOffOutlined fontSize="small" /> : <VolumeUpOutlined fontSize="small" />}
            </IconButton>
            
            <Slider
              value={isMuted ? 0 : volume}
              min={0}
              max={1}
              step={0.01}
              onChange={handleVolumeChange}
              size="small"
              sx={{ width: 80 }}
            />
          </Stack>
        )}
      </Box>
    </Paper>
  );
};

export default AudioPlayer;
