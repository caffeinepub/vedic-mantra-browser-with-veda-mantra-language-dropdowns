import { useState } from 'react';
import { Veda, ExternalBlob } from '../backend';
import { useMantraAudio, useUploadMantraAudio } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Music, Upload, AlertCircle, Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

interface MantraAudioSectionProps {
  veda: Veda;
  mantraNumber: bigint;
}

export function MantraAudioSection({ veda, mantraNumber }: MantraAudioSectionProps) {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Get authentication state
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = identity && !identity.getPrincipal().isAnonymous();

  // Fetch existing audio
  const { data: audioBlob, isFetching: isFetchingAudio, error: audioError } = useMantraAudio(veda, mantraNumber);

  // Upload mutation
  const uploadMutation = useUploadMantraAudio();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast.error('Please select a valid audio file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with progress tracking
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Upload to backend
      await uploadMutation.mutateAsync({
        veda,
        mantraNumber,
        audioBlob: blob,
      });

      toast.success('Audio uploaded successfully');
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload audio');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Card className="mb-8 shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          Audio
        </CardTitle>
        <CardDescription>
          Listen to or upload audio for this mantra
        </CardDescription>
      </CardHeader>
      <CardContent>
        {audioError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading audio. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isFetchingAudio && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        )}

        {/* Audio player and upload controls */}
        {!isFetchingAudio && !audioError && (
          <div className="space-y-4">
            {/* Existing audio player */}
            {audioBlob ? (
              <div className="space-y-2">
                <audio
                  controls
                  className="w-full"
                  src={audioBlob.getDirectURL()}
                  preload="metadata"
                >
                  Your browser does not support the audio element.
                </audio>
                {isAuthenticated && (
                  <p className="text-xs text-muted-foreground">
                    Upload a new file to replace the existing audio
                  </p>
                )}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No audio is available for this mantra yet.
                  {isAuthenticated ? ' Upload an audio file below.' : ' Log in to upload audio.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Upload controls - only show if authenticated */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => document.getElementById('audio-file-input')?.click()}
                  className="relative"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {audioBlob ? 'Replace Audio' : 'Upload Audio'}
                    </>
                  )}
                </Button>
                <input
                  id="audio-file-input"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading && uploadProgress > 0 && (
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={login}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Log in to Upload Audio
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
