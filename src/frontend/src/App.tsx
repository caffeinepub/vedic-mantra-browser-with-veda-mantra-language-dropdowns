import { useState, useEffect } from 'react';
import { Veda, Language } from './backend';
import { useMantraNumbers, useMantraMeaning, useMantraText } from './hooks/useQueries';
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
import { BookOpen, Languages, Library } from 'lucide-react';

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
    // Match /samveda/:number or /samaveda/:number
    const match = path.match(/^\/(samveda|samaveda)\/(\d+)$/i);
    
    if (match) {
      const mantraNumber = parseInt(match[2], 10);
      setSelectedVeda(Veda.samaVeda);
      setSelectedMantra(mantraNumber);
      setIsDeepLinked(true);
    }
  }, []);

  // Fetch available mantra numbers for selected Veda
  const { data: mantraNumbers = [], isLoading: isLoadingNumbers, error: numbersError } = useMantraNumbers(selectedVeda);

  // Fetch text for selected combination
  const { data: mantraText, isLoading: isLoadingText, error: textError } = useMantraText(
    selectedVeda,
    selectedMantra,
    selectedLanguage
  );

  // Fetch meaning for selected combination
  const { data: meaning, isLoading: isLoadingMeaning, error: meaningError } = useMantraMeaning(
    selectedVeda,
    selectedMantra,
    selectedLanguage
  );

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
    } else {
      // No mantras available, reset to 0 unless deep-linked
      if (!isDeepLinked) {
        setSelectedMantra(0);
      }
    }
  }, [mantraNumbers, isDeepLinked, selectedMantra]);

  const vedaLabel = VEDA_OPTIONS.find(v => v.value === selectedVeda)?.label || '';

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
                    onValueChange={(value) => {
                      setSelectedVeda(value as Veda);
                      setIsDeepLinked(false);
                    }}
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
                    value={selectedMantra.toString()}
                    onValueChange={(value) => {
                      setSelectedMantra(Number(value));
                      setIsDeepLinked(false);
                    }}
                    disabled={isLoadingNumbers}
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
                    <p className="text-xs text-muted-foreground">
                      No mantras available for this Veda
                    </p>
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
                    onValueChange={(value) => setSelectedLanguage(value as Language)}
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
                {vedaLabel} - Mantra {selectedMantra}
              </CardTitle>
              <CardDescription>
                Text in {LANGUAGE_OPTIONS.find(l => l.value === selectedLanguage)?.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {numbersError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Error loading mantra numbers. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {textError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Error loading mantra text. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {isLoadingText && (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              )}

              {!isLoadingText && !textError && selectedMantra > 0 && (
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {mantraText ? (
                    <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap font-medium">
                      {mantraText}
                    </p>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        No text available for this selection.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {selectedMantra === 0 && !isLoadingNumbers && (
                <Alert>
                  <AlertDescription>
                    Please select a mantra to view its text.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Meaning Display */}
          <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Meaning</CardTitle>
              <CardDescription>
                Interpretation in {LANGUAGE_OPTIONS.find(l => l.value === selectedLanguage)?.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {meaningError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Error loading mantra meaning. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {isLoadingMeaning && (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              )}

              {!isLoadingMeaning && !meaningError && selectedMantra > 0 && (
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {meaning ? (
                    <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                      {meaning}
                    </p>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        No meaning available for this selection.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {selectedMantra === 0 && !isLoadingNumbers && (
                <Alert>
                  <AlertDescription>
                    Please select a mantra to view its meaning.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-border/40 bg-card/30 backdrop-blur-sm">
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
