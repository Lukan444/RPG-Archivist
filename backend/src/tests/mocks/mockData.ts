// Mock data for testing

// Mock session analysis
export const mockSessionAnalysis = {
  analysis_id: 'analysis-123',
  session_id: 'session-123',
  transcription_id: 'transcription-123',
  recording_id: 'recording-123',
  created_by: 'user-123',
  created_at: '2024-06-30T12:00:00Z',
  updated_at: '2024-06-30T12:30:00Z',
  status: 'completed',
  summary: 'This is a test summary of the session.',
  key_points: [
    {
      key_point_id: 'kp1',
      text: 'The party discovered a hidden treasure in the cave.',
      segment_ids: ['segment1'],
      importance_score: 0.8,
      category: 'discovery'
    },
    {
      key_point_id: 'kp2',
      text: 'The group decided to travel to the northern mountains.',
      segment_ids: ['segment2'],
      importance_score: 0.7,
      category: 'decision'
    }
  ],
  character_insights: [
    {
      character_id: 'char1',
      speaker_id: 'speaker1',
      name: 'Gandalf',
      participation_score: 0.7,
      sentiment_score: 0.6,
      topics_of_interest: ['magic', 'adventure'],
      notable_quotes: [
        {
          text: 'You shall not pass!',
          segment_id: 'segment3',
          start_time: 120,
          end_time: 125,
          importance_score: 0.9
        }
      ],
      key_interactions: [
        {
          character_id: 'char2',
          speaker_id: 'speaker2',
          name: 'Frodo',
          interaction_count: 5,
          sentiment_score: 0.8,
          context: 'Discussing the journey to Mordor'
        }
      ]
    }
  ],
  plot_developments: [
    {
      plot_development_id: 'pd1',
      title: 'Discovery of the Ring',
      description: 'The party discovered the One Ring in the cave.',
      segment_ids: ['segment1'],
      importance_score: 0.9,
      related_entities: [
        {
          entity_id: 'item1',
          entity_type: 'item',
          name: 'The One Ring',
          relevance_score: 0.95
        }
      ]
    }
  ],
  sentiment_analysis: {
    overall_sentiment: 0.6,
    sentiment_distribution: {
      positive: 0.6,
      neutral: 0.3,
      negative: 0.1
    },
    sentiment_timeline: [
      {
        time: 60,
        sentiment_score: 0.7,
        context: 'The party was celebrating their victory'
      },
      {
        time: 120,
        sentiment_score: 0.3,
        context: 'The party encountered a dangerous enemy'
      }
    ]
  },
  topics: [
    {
      topic_id: 'topic1',
      name: 'Magic',
      keywords: ['spell', 'wizard', 'enchantment'],
      relevance_score: 0.8,
      segment_ids: ['segment1', 'segment3']
    },
    {
      topic_id: 'topic2',
      name: 'Journey',
      keywords: ['travel', 'mountain', 'path'],
      relevance_score: 0.7,
      segment_ids: ['segment2']
    }
  ],
  metadata: {
    model_version: 'GPT-4',
    processing_time_seconds: 5.2,
    word_count: 1200,
    confidence_score: 0.85
  }
};

// Mock transcription
export const mockTranscription = {
  transcription_id: 'transcription-123',
  session_id: 'session-123',
  recording_id: 'recording-123',
  created_by: 'user-123',
  created_at: '2024-06-29T12:00:00Z',
  updated_at: '2024-06-29T12:30:00Z',
  status: 'completed',
  language: 'en',
  duration_seconds: 600,
  word_count: 1200,
  segments: [
    {
      segment_id: 'segment1',
      start_time: 0,
      end_time: 60,
      text: 'Welcome to our adventure. Today we will explore the mysterious cave.',
      speaker_id: 'speaker1',
      speaker_name: 'Gandalf',
      confidence_score: 0.9
    },
    {
      segment_id: 'segment2',
      start_time: 60,
      end_time: 120,
      text: 'I think we should head to the northern mountains after this.',
      speaker_id: 'speaker2',
      speaker_name: 'Frodo',
      confidence_score: 0.85
    },
    {
      segment_id: 'segment3',
      start_time: 120,
      end_time: 180,
      text: 'You shall not pass!',
      speaker_id: 'speaker1',
      speaker_name: 'Gandalf',
      confidence_score: 0.95
    }
  ],
  full_text: 'Welcome to our adventure. Today we will explore the mysterious cave. I think we should head to the northern mountains after this. You shall not pass!'
};

// Mock session
export const mockSession = {
  session_id: 'session-123',
  campaign_id: 'campaign-123',
  name: 'The Cave of Wonders',
  description: 'The party explores a mysterious cave and discovers ancient treasures.',
  date: '2024-06-28',
  duration: 120,
  created_by: 'user-123',
  created_at: '2024-06-27T12:00:00Z',
  updated_at: '2024-06-27T12:30:00Z',
  image_url: 'https://example.com/image.jpg',
  hasTranscription: true
};

// Mock audio recording
export const mockAudioRecording = {
  recording_id: 'recording-123',
  session_id: 'session-123',
  name: 'Cave of Wonders Recording',
  description: 'Audio recording of the Cave of Wonders session',
  file_path: '/recordings/recording-123.mp3',
  duration_seconds: 600,
  file_size_bytes: 12000000,
  file_format: 'mp3',
  created_by: 'user-123',
  created_at: '2024-06-28T12:00:00Z',
  updated_at: '2024-06-28T12:30:00Z',
  transcription_status: 'completed',
  transcription_id: 'transcription-123'
};
