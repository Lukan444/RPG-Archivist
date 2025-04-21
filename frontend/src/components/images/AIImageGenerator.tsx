import React, { useState } from 'react';

interface AIImageGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
  maxPromptLength?: number;
}

const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({
  onImageGenerated,
  maxPromptLength = 500
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (prompt.length > maxPromptLength) {
      setError(`Prompt is too long. Maximum length is ${maxPromptLength} characters.`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // This is a placeholder for actual API call
      // In a real implementation, you would call your image generation API
      console.log('Generating image with prompt:', prompt);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Placeholder result - in real implementation this would be the URL from the API
      const mockImageUrl = 'https://placeholder.com/ai-generated-image';

      if (onImageGenerated) {
        onImageGenerated(mockImageUrl);
      }
    } catch (err) {
      setError('Failed to generate image. Please try again.');
      console.error('Image generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="ai-image-generator">
      <h3>AI Image Generator</h3>

      <div className="prompt-input">
        <label htmlFor="image-prompt">Describe the image you want to generate:</label>
        <textarea
          id="image-prompt"
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Describe the image you want to generate..."
          rows={4}
          disabled={isGenerating}
          maxLength={maxPromptLength}
        />
        <div className="character-count">
          {prompt.length}/{maxPromptLength}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="generate-button"
      >
        {isGenerating ? 'Generating...' : 'Generate Image'}
      </button>
    </div>
  );
};

export default AIImageGenerator;
