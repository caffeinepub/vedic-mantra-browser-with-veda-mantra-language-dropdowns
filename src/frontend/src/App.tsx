import { useState, useEffect } from 'react';
import { Veda, Language } from './backend';
import { useMantraNumbers, useMantraMeaning, useMantraText, useMantraMetadata } from './hooks/useQueries';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Languages, Library, AlertCircle } from 'lucide-react';
import { MantraMetadataHeader } from './components/MantraMetadataHeader';
import { MantraAudioSection } from './components/MantraAudioSection';

const VEDA_OPTIONS = [
  { value: Veda.rikVeda, label: 'Rigveda' },
  { value: Veda.yajurVeda, label: 'Yajurveda' },
  { value: Veda.samaVeda, label: 'Samaveda' },
  { value: Veda.atharvaVeda, label: 'Atharvaveda' },
];

const LANGUAGE_OPTIONS = [
  { value: Language.telugu, label: 'Telugu' },
  { value: Language.english, label: 'English' },
  { value: Language.hindi, label: 'Hindi' },
];

function App() {
  const [selectedVeda, setSelectedVeda] = useState<Veda>(Veda.rikVeda);
  const [selectedMantra, setSelectedMantra] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.english);
  const [isDeepLinked, setIsDeepLinked] = useState<boolean>(false);

  // Parse deep link on initial load
  useEffect(() => {
    const path = window.location.pathname;
    // Match /samveda/:number with optional trailing slash, case-insensitive
    const match = path.match(/^\/samaveda\/(\d+)\/?$/i);
    
    if (match) {
      const mantraNumber = parseInt(match[1], 10);
      setSelectedVeda(Veda.samaVeda);
      setSelectedMantra(mantraNumber);
      setSelectedLanguage(Language.english); // Explicitly set language to English for deep links
      setIsDeepLinked(true);
    }
  }, []);

  // Fetch available mantra numbers for selected Veda
  const { data: mantraNumbers = [], isLoading: isLoadingNumbers, error: numbersError } = useMantraNumbers(selectedVeda);

  // Fetch metadata for selected combination
  const { data: metadata, isFetching: isFetchingMetadata, error: metadataError } = useMantraMetadata(
    selectedVeda,
    selectedMantra,
    selectedLanguage
  );

  // Fetch text for selected combination
  const { data: mantraText, isFetching: isFetchingText, error: textError } = useMantraText(
    selectedVeda,
    selectedMantra,
    selectedLanguage
  );

  // Fetch meaning for selected combination
  const { data: meaning, isFetching: isFetchingMeaning, error: meaningError } = useMantraMeaning(
    selectedVeda,
    selectedMantra,
    selectedLanguage
  );

  // Handle Veda change: reset mantra selection immediately
  const handleVedaChange = (value: string) => {
    setSelectedVeda(value as Veda);
    setSelectedMantra(0); // Reset to 0 immediately to clear stale content
    setIsDeepLinked(false);
  };

  // Handle Language change: ensure UI updates immediately
  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value as Language);
  };

  // Auto-select first mantra when Veda changes (but not if deep-linked)
  useEffect(() => {
    if (mantraNumbers.length > 0) {
      // If deep-linked and the current selection is valid, keep it
      if (isDeepLinked && selectedMantra > 0) {
        // Check if the deep-linked mantra is in the list
        const isValidMantra = mantraNumbers.includes(selectedMantra);
        if (isValidMantra) {
          // Keep the deep-linked selection
          return;
        }
        // If not valid, fall through to auto-select first
      }
      
      // Auto-select first mantra if no valid selection
      if (selectedMantra === 0 || !mantraNumbers.includes(selectedMantra)) {
        setSelectedMantra(mantraNumbers[0]);
      }
    }
  }, [mantraNumbers, isDeepLinked, selectedMantra]);

  const vedaLabel = VEDA_OPTIONS.find(v => v.value === selectedVeda)?.label || '';
  const languageLabel = LANGUAGE_OPTIONS.find(l => l.value === selectedLanguage)?.label || '';

  // Helper function to check if text is valid (not null, not empty, not just whitespace)
  const hasValidText = (text: string | null | undefined): boolean => {
    return !!text && text.trim().length > 0;
  };

  // Check if we should show the audio section (Samaveda, Mantra 47)
  const shouldShowAudio = selectedVeda === Veda.samaVeda && selectedMantra === 47;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 relative overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="fixed inset-0 opacity-[0.03] bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: 'url(/assets/generated/vedic-bg.dim_1920x1080.png)' }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Vedic Mantra Browser
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Explore ancient wisdom across Vedas and languages
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Selection Controls */}
          <Card className="mb-8 shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Select Mantra</CardTitle>
              <CardDescription>
                Choose a Veda, mantra number, and language to view the text and meaning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Veda Selection */}
                <div className="space-y-2">
                  <Label htmlFor="veda-select" className="flex items-center gap-2 text-sm font-medium">
                    <Library className="h-4 w-4 text-primary" />
                    Veda
                  </Label>
                  <Select
                    value={selectedVeda}
                    onValueChange={handleVedaChange}
                  >
                    <SelectTrigger id="veda-select" className="w-full">
                      <SelectValue placeholder="Select a Veda" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEDA_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mantra Number Selection */}
                <div className="space-y-2">
                  <Label htmlFor="mantra-select" className="flex items-center gap-2 text-sm font-medium">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Mantra Number
                  </Label>
                  <Select
                    value={selectedMantra > 0 ? selectedMantra.toString() : ""}
                    onValueChange={(value) => {
                      setSelectedMantra(Number(value));
                      setIsDeepLinked(false);
                    }}
                    disabled={isLoadingNumbers || mantraNumbers.length === 0}
                  >
                    <SelectTrigger id="mantra-select" className="w-full">
                      <SelectValue placeholder={isLoadingNumbers ? "Loading..." : "Select mantra"} />
                    </SelectTrigger>
                    <SelectContent>
                      {mantraNumbers.map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mantraNumbers.length === 0 && !isLoadingNumbers && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No mantras are available for <strong>{vedaLabel}</strong>. The database may not contain content for this Veda yet.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <Label htmlFor="language-select" className="flex items-center gap-2 text-sm font-medium">
                    <Languages className="h-4 w-4 text-primary" />
                    Language
                  </Label>
                  <Select
                    value={selectedLanguage}
                    onValueChange={handleLanguageChange}
                  >
                    <SelectTrigger id="language-select" className="w-full">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mantra Text Display */}
          <Card className="mb-8 shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">
                {vedaLabel} - Mantra {selectedMantra > 0 ? selectedMantra : '—'}
              </CardTitle>
              <CardDescription>
                Text in {languageLabel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {numbersError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Error loading mantra numbers. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {textError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Error loading mantra text. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {metadataError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Error loading mantra metadata. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Show loading state during fetch */}
              {(isFetchingMetadata || isFetchingText) && selectedMantra > 0 && (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              )}

              {/* Only show content when not fetching and no error */}
              {!isFetchingMetadata && !isFetchingText && !textError && !metadataError && selectedMantra > 0 && (
                <div className="space-y-6">
                  {/* Metadata Header */}
                  {hasValidText(metadata) && (
                    <MantraMetadataHeader metadata={metadata!} />
                  )}

                  {/* Mantra Text */}
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    {hasValidText(mantraText) ? (
                      <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap font-medium">
                        {mantraText}
                      </p>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No text is available for <strong>{vedaLabel}</strong>, Mantra <strong>{selectedMantra}</strong>, in <strong>{languageLabel}</strong>. This combination may not exist in the database yet.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}

              {selectedMantra === 0 && !isLoadingNumbers && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select a mantra to view its text.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Audio Section - Only for Samaveda Mantra 47 */}
          {shouldShowAudio && (
            <MantraAudioSection veda={selectedVeda} mantraNumber={selectedMantra} />
          )}

          {/* Meaning Display */}
          <Card className="mb-8 shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Meaning</CardTitle>
              <CardDescription>
                Interpretation in {languageLabel}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {meaningError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Error loading mantra meaning. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Show loading state during fetch */}
              {isFetchingMeaning && selectedMantra > 0 && (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              )}

              {/* Only show content when not fetching and no error */}
              {!isFetchingMeaning && !meaningError && selectedMantra > 0 && (
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {hasValidText(meaning) ? (
                    <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                      {meaning}
                    </p>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No meaning is available for <strong>{vedaLabel}</strong>, Mantra <strong>{selectedMantra}</strong>, in <strong>{languageLabel}</strong>. This combination may not exist in the database yet.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {selectedMantra === 0 && !isLoadingNumbers && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select a mantra to view its meaning.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm mt-16">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-sm text-muted-foreground">
              © 2026. Built with love using{' '}
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
