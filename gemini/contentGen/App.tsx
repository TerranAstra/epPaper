
import React, { useState, useCallback } from 'react';
import { generateStory, generateImage } from './services/geminiService';
import { SectionCard } from './components/SectionCard';
import { TextInput } from './components/TextInput';
import { Button } from './components/Button';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { GeneratedImageDisplay } from './components/GeneratedImageDisplay';
import { GeneratedTextDisplay } from './components/GeneratedTextDisplay';

const App: React.FC = () => {
  const [storyPrompt, setStoryPrompt] = useState<string>('A brave knight and a friendly dragon on an adventure.');
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const [storyLoading, setStoryLoading] = useState<boolean>(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  const [imagePrompt, setImagePrompt] = useState<string>('A futuristic city skyline at sunset, synthwave style.');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleGenerateStory = useCallback(async () => {
    if (!storyPrompt.trim()) {
      setStoryError('Story prompt cannot be empty.');
      return;
    }
    setStoryLoading(true);
    setGeneratedStory('');
    setStoryError(null);
    try {
      const story = await generateStory(storyPrompt);
      setGeneratedStory(story);
    } catch (error) {
      console.error('Story generation error:', error);
      setStoryError(error instanceof Error ? error.message : 'An unknown error occurred while generating the story.');
    } finally {
      setStoryLoading(false);
    }
  }, [storyPrompt]);

  const handleGenerateImage = useCallback(async () => {
    if (!imagePrompt.trim()) {
      setImageError('Image prompt cannot be empty.');
      return;
    }
    setImageLoading(true);
    setGeneratedImageUrl(null);
    setImageError(null);
    try {
      const imageUrl = await generateImage(imagePrompt);
      setGeneratedImageUrl(imageUrl);
    } catch (error) {
      console.error('Image generation error:', error);
      // Displaying the specific error message from the user's log example if it matches
      if (error instanceof Error && error.message.includes("Imagen API is only accessible to billed users")) {
         setImageError(`Failed to generate image: ${error.message}. Please ensure your Google Cloud project has billing enabled and the Imagen API is active for your account.`);
      } else {
        setImageError(error instanceof Error ? error.message : 'An unknown error occurred while generating the image.');
      }
    } finally {
      setImageLoading(false);
    }
  }, [imagePrompt]);

  return (
    <div className="min-h-screen container mx-auto p-4 md:p-8 flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse">
          Creative Content Generator
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Powered by Gemini API</p>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <SectionCard title="Story Generator" icon="📖">
          <TextInput
            id="storyPrompt"
            label="Enter your story idea:"
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            placeholder="e.g., A lost robot searching for its creator"
            disabled={storyLoading}
          />
          <Button onClick={handleGenerateStory} disabled={storyLoading} className="mt-4 w-full bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600">
            {storyLoading ? <LoadingSpinner size="sm" /> : 'Generate Story'}
          </Button>
          {storyError && <ErrorMessage message={storyError} className="mt-4" />}
          {generatedStory && !storyLoading && <GeneratedTextDisplay text={generatedStory} />}
        </SectionCard>

        <SectionCard title="Image Generator" icon="🖼️">
          <TextInput
            id="imagePrompt"
            label="Enter your image description:"
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="e.g., A cat wearing a tiny wizard hat"
            disabled={imageLoading}
          />
          <Button onClick={handleGenerateImage} disabled={imageLoading} className="mt-4 w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600">
            {imageLoading ? <LoadingSpinner size="sm" /> : 'Generate Image'}
          </Button>
          {imageError && <ErrorMessage message={imageError} className="mt-4" />}
          {generatedImageUrl && !imageLoading && <GeneratedImageDisplay src={generatedImageUrl} alt={imagePrompt} />}
        </SectionCard>
      </div>
      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>
          Make sure your API_KEY environment variable is correctly set up.
          If you encounter errors with Image Generation, ensure your Google Cloud project is properly billed for Imagen API usage.
        </p>
        <p>&copy; {new Date().getFullYear()} AI Content Tools Inc.</p>
      </footer>
    </div>
  );
};

export default App;
    