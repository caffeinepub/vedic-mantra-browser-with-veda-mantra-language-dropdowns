import { useState, useEffect, useMemo } from 'react';
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
  { value: 'rikVeda', label: 'Rigveda', slug: 'rigveda', enum: Veda.rikVeda },
  { value: 'yajurVeda', label: 'Yajurveda', slug: 'yajurveda', enum: Veda.yajurVeda },
  { value: 'samaVeda', label: 'Samaveda', slug: 'samaveda', enum: Veda.samaVeda },
  { value: 'atharvaVeda', label: 'Atharvaveda', slug: 'atharvaveda', enum: Veda.atharvaVeda },
];

const LANGUAGE_OPTIONS = [
  { value: 'telugu', label: 'Telugu', enum: Language.telugu },
  { value: 'english', label: 'English', enum: Language.english },
  { value: 'hindi', label: 'Hindi', enum: Language.hindi },
];

// Helper to map slug to Veda string
function slugToVedaString(slug: string): string | null {
  const normalized = slug.toLowerCase();
  const option = VEDA_OPTIONS.find(opt => opt.slug === normalized);
  return option ? option.value : null;
}

// Helper to map Veda string to slug
function vedaStringToSlug(vedaStr: string): string {
  const option = VEDA_OPTIONS.find(opt => opt.value === vedaStr);
  return option?.slug || 'samaveda';
}

// Helper to map string to Veda enum
function stringToVedaEnum(vedaStr: string): Veda {
  const option = VEDA_OPTIONS.find(opt => opt.value === vedaStr);
  return option?.enum || Veda.samaVeda;
}

// Helper to map string to Language enum
function stringToLanguageEnum(langStr: string): Language {
  const option = LANGUAGE_OPTIONS.find(opt => opt.value === langStr);
  return option?.enum || Language.english;
}

function App() {
  // All Select state is now string-controlled
  const [selectedVedaString, setSelectedVedaString] = useState<string>('rikVeda');
  const [selectedMantraString, setSelectedMantraString] = useState<string>('');
  const [selectedLanguageString, setSelectedLanguageString] = useState<string>('english');
  const [isDeepLinked, setIsDeepLinked] = useState<boolean>(false);

  // Parse deep link on initial load - support /<veda-slug>/<number>
  useEffect(() => {
    const path = window.location.pathname;
    // Match /<veda-slug>/:number with optional trailing slash, case-insensitive
    const match = path.match(/^\/([a-z]+)\/(\d+)\/?$/i);
    
    if (match) {
      const vedaSlug = match[1];
      const mantraNumber = match[2];
      const vedaStr = slugToVedaString(vedaSlug);
      
      if (vedaStr) {
        setSelectedVedaString(vedaStr);
        setSelectedMantraString(mantraNumber);
        setSelectedLanguageString('english');
        setIsDeepLinked(true);
      }
    }
  }, []);

  // Convert string state to enums for backend queries
  const selectedVeda = stringToVedaEnum(selectedVedaString);
  const selectedLanguage = stringToLanguageEnum(selectedLanguageString);
  const selectedMantra = selectedMantraString ? BigInt(selectedMantraString) : 0n;

  // Sync URL when user changes selection
  useEffect(() => {
    if (selectedMantra > 0n) {
      const slug = vedaStringToSlug(selectedVedaString);
      const newPath = `/${slug}/${selectedMantra.toString()}`;
      
      // Only update if path changed to avoid infinite loops
      if (window.location.pathname !== newPath) {
        window.history.pushState({}, '', newPath);
      }
    }
  }, [selectedVedaString, selectedMantra]);

  // Fetch available mantra numbers for selected Veda
  const { data: mantraNumbers = [], isLoading: isLoadingNumbers, error: numbersError } = useMantraNumbers(selectedVeda);

  // Defensive de-duplication and sorting at render time
  const uniqueSortedMantraNumbers = useMemo(() => {
    const seen = new Set<string>();
    const unique: bigint[] = [];
    
    for (const num of mantraNumbers) {
      const key = num.toString();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(num);
      }
    }
    
    // Ensure ascending numeric order
    return unique.sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  }, [mantraNumbers]);

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
    setSelectedVedaString(value);
    setSelectedMantraString(''); // Reset to empty string immediately to clear stale content
    setIsDeepLinked(false);
  };

  // Handle Language change: ensure UI updates immediately
  const handleLanguageChange = (value: string) => {
    setSelectedLanguageString(value);
  };

  // Auto-select first mantra when Veda changes (but not if deep-linked)
  useEffect(() => {
    if (uniqueSortedMantraNumbers.length > 0) {
      // If deep-linked and the current selection is valid, keep it
      if (isDeepLinked && selectedMantra > 0n) {
        // Check if the deep-linked mantra is in the list
        const isValidMantra = uniqueSortedMantraNumbers.some(num => num === selectedMantra);
        if (isValidMantra) {
          // Keep the deep-linked selection
          return;
        }
        // If not valid, fall through to auto-select first
      }
      
      // Auto-select first mantra if no valid selection
      if (!selectedMantraString || !uniqueSortedMantraNumbers.some(num => num.toString() === selectedMantraString)) {
        setSelectedMantraString(uniqueSortedMantraNumbers[0].toString());
      }
    }
  }, [uniqueSortedMantraNumbers, isDeepLinked, selectedMantra, selectedMantraString]);

  const vedaLabel = VEDA_OPTIONS.find(v => v.value === selectedVedaString)?.label || '';
  const languageLabel = LANGUAGE_OPTIONS.find(l => l.value === selectedLanguageString)?.label || '';

  // Helper function to check if text is valid (not null, not empty, not just whitespace)
  const hasValidText = (text: string | null | undefined): boolean => {
    return !!text && text.trim().length > 0;
  };

  // Check if we should show the audio section (Samaveda, Mantra 47)
  const shouldShowAudio = selectedVeda === Veda.samaVeda && selectedMantra === 47n;

  // Check if selected mantra value is valid in current options
  const isMantraValueValid = selectedMantraString && uniqueSortedMantraNumbers.some(
    num => num.toString() === selectedMantraString
  );

  // Diagnostic: Check if we have a mismatch
  const showMantraMismatchDiagnostic = selectedMantraString && !isMantraValueValid && !isLoadingNumbers;

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
                    value={selectedVedaString}
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
                    value={selectedMantraString}
                    onValueChange={(value) => {
                      setSelectedMantraString(value);
                      setIsDeepLinked(false);
                    }}
                    disabled={isLoadingNumbers || uniqueSortedMantraNumbers.length === 0}
                  >
                    <SelectTrigger id="mantra-select" className="w-full">
                      <SelectValue placeholder={isLoadingNumbers ? "Loading..." : "Select mantra"} />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSortedMantraNumbers.map((num) => (
                        <SelectItem key={num.toString()} value={num.toString()}>
                          {num.toString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Diagnostic: Empty mantra numbers */}
                  {uniqueSortedMantraNumbers.length === 0 && !isLoadingNumbers && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No mantras are available for <strong>{vedaLabel}</strong>. 
                        Current Veda: {selectedVedaString}, 
                        Loading: {isLoadingNumbers ? 'yes' : 'no'}, 
                        Count: {uniqueSortedMantraNumbers.length}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Diagnostic: Mantra value mismatch */}
                  {showMantraMismatchDiagnostic && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Selected mantra value "{selectedMantraString}" is not in the loaded options for <strong>{vedaLabel}</strong>. 
                        Available: {uniqueSortedMantraNumbers.map(n => n.toString()).join(', ') || 'none'}
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
                    value={selectedLanguageString}
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
                {vedaLabel} - Mantra {selectedMantra > 0n ? selectedMantra.toString() : '—'}
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
              {(isFetchingMetadata || isFetchingText) && selectedMantra > 0n && (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              )}

              {/* Only show content when not fetching and no error */}
              {!isFetchingMetadata && !isFetchingText && !textError && !metadataError && selectedMantra > 0n && (
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
                          No text is available for <strong>{vedaLabel}</strong>, Mantra <strong>{selectedMantra.toString()}</strong>, in <strong>{languageLabel}</strong>.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              )}

              {selectedMantra === 0n && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select a mantra number to view its text.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Audio Section - Only for Samaveda Mantra 47 */}
          {shouldShowAudio && (
            <MantraAudioSection
              veda={selectedVeda}
              mantraNumber={selectedMantra}
            />
          )}

          {/* Mantra Meaning Display */}
          <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
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
              {isFetchingMeaning && selectedMantra > 0n && (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              )}

              {/* Only show content when not fetching and no error */}
              {!isFetchingMeaning && !meaningError && selectedMantra > 0n && (
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {hasValidText(meaning) ? (
                    <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {meaning}
                    </p>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No meaning is available for <strong>{vedaLabel}</strong>, Mantra <strong>{selectedMantra.toString()}</strong>, in <strong>{languageLabel}</strong>.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {selectedMantra === 0n && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select a mantra number to view its meaning.
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
              © 2026. Built with ❤️ using{' '}
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
