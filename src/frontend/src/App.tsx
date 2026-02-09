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
import { MantraContentTemplate } from './components/MantraContentTemplate';
import { ShareArea } from './components/ShareArea';

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
  const [selectedVedaString, setSelectedVedaString] = useState<string>('');
  const [selectedMantraString, setSelectedMantraString] = useState<string>('');
  const [selectedLanguageString, setSelectedLanguageString] = useState<string>('english');
  const [isDeepLinked, setIsDeepLinked] = useState<boolean>(false);
  const [hasAutoSelected, setHasAutoSelected] = useState<boolean>(false);
  const [shorthandError, setShorthandError] = useState<string | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState<boolean>(false);

  // Parse deep link on initial load - support /<veda-slug>/<number> and /<number>
  useEffect(() => {
    // First check if we have a redirect query parameter from 404.html
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get('redirect');
    
    let path = redirectPath || window.location.pathname;
    
    // If we had a redirect, clean up the URL
    if (redirectPath) {
      window.history.replaceState({}, '', redirectPath);
    }
    
    // Match /<veda-slug>/:number with optional trailing slash, case-insensitive
    const fullMatch = path.match(/^\/([a-z]+)\/(\d+)\/?$/i);
    
    if (fullMatch) {
      const vedaSlug = fullMatch[1];
      const mantraNumber = fullMatch[2];
      const vedaStr = slugToVedaString(vedaSlug);
      
      if (vedaStr) {
        setSelectedVedaString(vedaStr);
        setSelectedMantraString(mantraNumber);
        setSelectedLanguageString('english');
        setIsDeepLinked(true);
        setHasAutoSelected(true);
        return;
      }
    }
    
    // Match shorthand /<number> with optional trailing slash
    const shorthandMatch = path.match(/^\/(\d+)\/?$/);
    
    if (shorthandMatch) {
      const mantraNumber = shorthandMatch[1];
      
      // Default to Samaveda + English for shorthand links
      setSelectedVedaString('samaVeda');
      setSelectedMantraString(mantraNumber);
      setSelectedLanguageString('english');
      setIsDeepLinked(true);
      setHasAutoSelected(true);
      
      // Normalize URL to canonical form /samaveda/<number>
      const canonicalPath = `/samaveda/${mantraNumber}`;
      window.history.replaceState({}, '', canonicalPath);
    }
  }, []);

  // Convert string state to enums for backend queries
  const selectedVeda = selectedVedaString ? stringToVedaEnum(selectedVedaString) : Veda.samaVeda;
  const selectedLanguage = stringToLanguageEnum(selectedLanguageString);
  const selectedMantra = selectedMantraString ? BigInt(selectedMantraString) : 0n;

  // Fetch available mantra numbers for all Vedas to enable auto-selection
  const { data: rikVedaNumbers = [], isLoading: isLoadingRikVeda } = useMantraNumbers(Veda.rikVeda);
  const { data: yajurVedaNumbers = [], isLoading: isLoadingYajurVeda } = useMantraNumbers(Veda.yajurVeda);
  const { data: samaVedaNumbers = [], isLoading: isLoadingSamaVeda } = useMantraNumbers(Veda.samaVeda);
  const { data: atharvaVedaNumbers = [], isLoading: isLoadingAtharvaVeda } = useMantraNumbers(Veda.atharvaVeda);

  // Fetch available mantra numbers for selected Veda
  const { data: mantraNumbers = [], isLoading: isLoadingNumbers, error: numbersError } = useMantraNumbers(selectedVeda);

  // Auto-select Veda if only one has mantras and not deep-linked
  useEffect(() => {
    if (hasAutoSelected || isDeepLinked) return;
    
    const allLoading = isLoadingRikVeda || isLoadingYajurVeda || isLoadingSamaVeda || isLoadingAtharvaVeda;
    if (allLoading) return;

    const vedasWithMantras = [
      { value: 'rikVeda', numbers: rikVedaNumbers },
      { value: 'yajurVeda', numbers: yajurVedaNumbers },
      { value: 'samaVeda', numbers: samaVedaNumbers },
      { value: 'atharvaVeda', numbers: atharvaVedaNumbers },
    ].filter(v => v.numbers.length > 0);

    if (vedasWithMantras.length === 1 && !selectedVedaString) {
      const onlyVeda = vedasWithMantras[0];
      setSelectedVedaString(onlyVeda.value);
      setHasAutoSelected(true);
    }
  }, [
    rikVedaNumbers,
    yajurVedaNumbers,
    samaVedaNumbers,
    atharvaVedaNumbers,
    isLoadingRikVeda,
    isLoadingYajurVeda,
    isLoadingSamaVeda,
    isLoadingAtharvaVeda,
    selectedVedaString,
    hasAutoSelected,
    isDeepLinked,
  ]);

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

  // Dev-only verification: Check if Mantra 48 is present for Samaveda
  useEffect(() => {
    if (import.meta.env.DEV && selectedVedaString === 'samaVeda' && !isLoadingNumbers && uniqueSortedMantraNumbers.length > 0) {
      const hasMantra48 = uniqueSortedMantraNumbers.some(num => num === 48n);
      if (!hasMantra48) {
        console.warn('[DEV] Mantra 48 is missing from Samaveda numbers list. Expected mantras:', uniqueSortedMantraNumbers.map(n => n.toString()));
      } else {
        console.log('[DEV] Mantra 48 is present in Samaveda numbers list.');
      }
    }
  }, [selectedVedaString, uniqueSortedMantraNumbers, isLoadingNumbers]);

  // Check for shorthand error: mantra not available for Samaveda
  useEffect(() => {
    if (isDeepLinked && selectedVedaString === 'samaVeda' && selectedMantraString && !isLoadingNumbers) {
      const requestedMantra = BigInt(selectedMantraString);
      const isAvailable = uniqueSortedMantraNumbers.some(num => num === requestedMantra);
      
      if (!isAvailable && uniqueSortedMantraNumbers.length > 0) {
        setShorthandError(
          `Mantra ${selectedMantraString} is not available for Samaveda. Please select from the available mantras.`
        );
      } else {
        setShorthandError(null);
      }
    }
  }, [isDeepLinked, selectedVedaString, selectedMantraString, uniqueSortedMantraNumbers, isLoadingNumbers]);

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
    setShorthandError(null);
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
  }, [uniqueSortedMantraNumbers, selectedMantraString, isDeepLinked, selectedMantra]);

  // Handle mantra selection change
  const handleMantraChange = (value: string) => {
    setSelectedMantraString(value);
    setIsDeepLinked(false);
    setShorthandError(null);
    
    // Update URL to reflect selection
    const slug = vedaStringToSlug(selectedVedaString);
    const newPath = `/${slug}/${value}`;
    window.history.pushState({}, '', newPath);
  };

  // Determine if we have valid content to display
  const hasValidContent = selectedMantra > 0n && (mantraText || meaning || metadata);
  const isLoading = isFetchingText || isFetchingMeaning || isFetchingMetadata;

  // Check if any query returned an error
  const hasError = textError || meaningError || metadataError || numbersError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Vedic Mantra Browser</h1>
                <p className="text-sm text-muted-foreground">Explore ancient wisdom</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Selection Controls */}
        <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="h-5 w-5" />
              Select Mantra
            </CardTitle>
            <CardDescription>Choose a Veda, mantra number, and language</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Veda Selection */}
              <div className="space-y-2">
                <Label htmlFor="veda-select">Veda</Label>
                <Select value={selectedVedaString} onValueChange={handleVedaChange}>
                  <SelectTrigger id="veda-select">
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
                <Label htmlFor="mantra-select">Mantra Number</Label>
                <Select
                  value={selectedMantraString}
                  onValueChange={handleMantraChange}
                  disabled={!selectedVedaString || isLoadingNumbers}
                >
                  <SelectTrigger id="mantra-select">
                    <SelectValue placeholder={isLoadingNumbers ? 'Loading...' : 'Select a mantra'} />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueSortedMantraNumbers.map((num) => (
                      <SelectItem key={num.toString()} value={num.toString()}>
                        Mantra {num.toString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language Selection */}
              <div className="space-y-2">
                <Label htmlFor="language-select" className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Language
                </Label>
                <Select value={selectedLanguageString} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language-select">
                    <SelectValue />
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

        {/* Error Display */}
        {shorthandError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{shorthandError}</AlertDescription>
          </Alert>
        )}

        {hasError && !shorthandError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load mantra content. Please try again or select a different mantra.
            </AlertDescription>
          </Alert>
        )}

        {/* Mantra Content Display */}
        {selectedVedaString && selectedMantraString && !shorthandError && (
          <>
            {isLoading ? (
              <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ) : hasValidContent ? (
              <>
                {/* Metadata Header */}
                {metadata && <MantraMetadataHeader metadata={metadata} />}

                {/* Mantra Text */}
                {mantraText && (
                  <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Mantra Text</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg leading-relaxed whitespace-pre-wrap text-foreground">
                        {mantraText}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Meaning */}
                {meaning && (
                  <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Meaning</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base leading-relaxed whitespace-pre-wrap text-muted-foreground">
                        {meaning}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Audio Section */}
                <MantraAudioSection veda={selectedVeda} mantraNumber={selectedMantra} />

                {/* Share Area */}
                <ShareArea />
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No content available for this mantra yet. You can add content using the template editor below.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Mantra Content Template - Always visible in production with Add button */}
        {selectedVedaString && selectedMantraString && !shorthandError && (
          <MantraContentTemplate
            veda={selectedVeda}
            mantraNumber={selectedMantra}
            isOpen={showTemplateEditor}
            onOpenChange={setShowTemplateEditor}
          />
        )}
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
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
