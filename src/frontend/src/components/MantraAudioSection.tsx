import { useState, useRef } from 'react';
import { Veda } from '../backend';
import { useMantraAudio, useUploadMantraAudio } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, Music, AlertCircle, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface MantraAudioSectionProps {
  veda: Veda;
  mantraNumber: number;
}

/**
 * Audio section component for manual upload and playback of mantra audio files.
 * Shows an HTML audio player when audio is available, or an empty state with upload controls.
 */
export function MantraAudioSection({ veda, mantraNumber }: MantraAudioSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing audio
  const {
    data: audioBlob,
    isLoading: isFetchingAudio,
    error: fetchError,
  } = useMantraAudio(veda, mantraNumber);

  // Upload mutation
  const uploadMutation = useUploadMantraAudio();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        alert('Please select a valid audio file.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // Convert File to Uint8Array
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with upload progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      // Upload to backend
      await uploadMutation.mutateAsync({
        veda,
        mantraNumber,
        audioBlob: blob,
      });

      // Reset state after successful upload
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const audioUrl = audioBlob ? audioBlob.getDirectURL() : null;

  return (
    <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Music className="h-5 w-5 text-primary" />
          Audio
        </CardTitle>
        <CardDescription>
          Listen to the mantra recitation or upload your own audio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fetch Error */}
        {fetchError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading audio. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Error */}
        {uploadMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {uploadMutation.error instanceof Error
                ? uploadMutation.error.message
                : 'Failed to upload audio. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isFetchingAudio && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {/* Audio Player - Show when audio exists */}
        {!isFetchingAudio && audioUrl && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <audio
                controls
                className="w-full"
                src={audioUrl}
                preload="metadata"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
            <p className="text-sm text-muted-foreground">
              Audio is available for this mantra. You can replace it by uploading a new file below.
            </p>
          </div>
        )}

        {/* Empty State - Show when no audio exists */}
        {!isFetchingAudio && !audioUrl && !fetchError && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No audio is available for Samaveda, Mantra {mantraNumber}.
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        {!isFetchingAudio && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="space-y-2">
              <Label htmlFor="audio-file" className="text-sm font-medium">
                {audioUrl ? 'Replace Audio File' : 'Upload Audio File'}
              </Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  id="audio-file"
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a"
                  onChange={handleFileSelect}
                  disabled={uploadMutation.isPending}
                  className="flex-1"
                />
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadMutation.isPending}
                  className="min-w-[120px]"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Upload Progress */}
            {uploadMutation.isPending && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success Message */}
            {uploadMutation.isSuccess && (
              <Alert className="bg-success/10 border-success/20">
                <AlertDescription className="text-success-foreground">
                  Audio uploaded successfully!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
