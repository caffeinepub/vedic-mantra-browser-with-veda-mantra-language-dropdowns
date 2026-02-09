import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, Plus, Send, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Veda } from '../backend';
import { useMantraTemplate, useSubmitMantraTemplate } from '../hooks/useQueries';

interface MantraContentTemplateProps {
  veda: Veda;
  mantraNumber: bigint;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MantraContentTemplate({ veda, mantraNumber, isOpen, onOpenChange }: MantraContentTemplateProps) {
  const [copied, setCopied] = useState(false);
  const [number, setNumber] = useState('');
  const [sanskrit, setSanskrit] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [telugu, setTelugu] = useState('');
  const [meaning, setMeaning] = useState('');
  const [englishMantra, setEnglishMantra] = useState('');
  const [englishMeaning, setEnglishMeaning] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch saved template from backend
  const { data: savedTemplate, isLoading: isLoadingTemplate } = useMantraTemplate(veda, mantraNumber);
  
  // Submit mutation
  const submitMutation = useSubmitMantraTemplate();

  // Parse saved template into fields
  useEffect(() => {
    // Reset all fields to defaults first
    setNumber(mantraNumber.toString());
    setSanskrit('');
    setTransliteration('');
    setTelugu('');
    setMeaning('');
    setEnglishMantra('');
    setEnglishMeaning('');

    if (savedTemplate) {
      const lines = savedTemplate.split('\n');
      lines.forEach(line => {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();
        
        switch (key.trim()) {
          case 'number':
            setNumber(value);
            break;
          case 'sanskrit':
            setSanskrit(value);
            break;
          case 'transliteration':
            setTransliteration(value);
            break;
          case 'telugu':
            setTelugu(value);
            break;
          case 'meaning':
            setMeaning(value);
            break;
          case 'english_mantra':
            setEnglishMantra(value);
            break;
          case 'english_meaning':
            setEnglishMeaning(value);
            break;
        }
      });
    }
  }, [savedTemplate, mantraNumber]);

  // Reset form and close state when veda or mantra changes
  useEffect(() => {
    setSubmitSuccess(false);
    setValidationError(null);
    onOpenChange(false);
  }, [veda, mantraNumber, onOpenChange]);

  const buildTemplateText = () => {
    return `number: ${number}
sanskrit: ${sanskrit}
transliteration: ${transliteration}
telugu: ${telugu}
meaning: ${meaning}
english_mantra: ${englishMantra}
english_meaning: ${englishMeaning}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildTemplateText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAdd = () => {
    // Clear all fields except number (prefill with current mantra)
    setNumber(mantraNumber.toString());
    setSanskrit('');
    setTransliteration('');
    setTelugu('');
    setMeaning('');
    setEnglishMantra('');
    setEnglishMeaning('');
    setSubmitSuccess(false);
    setValidationError(null);
    onOpenChange(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    setValidationError(null);
  };

  const validateNumber = (numStr: string): { valid: boolean; error?: string; value?: bigint } => {
    if (!numStr || numStr.trim() === '') {
      return { valid: false, error: 'Number field is required. Please enter a mantra number.' };
    }

    const trimmed = numStr.trim();
    
    // Check if it's a valid integer
    if (!/^\d+$/.test(trimmed)) {
      return { valid: false, error: 'Number must be a valid positive integer.' };
    }

    try {
      const value = BigInt(trimmed);
      
      if (value <= 0n) {
        return { valid: false, error: 'Number must be greater than 0.' };
      }

      return { valid: true, value };
    } catch (e) {
      return { valid: false, error: 'Invalid number format.' };
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitSuccess(false);
      setValidationError(null);

      // Validate the number field
      const validation = validateNumber(number);
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid number');
        return;
      }

      // Submit using the validated number from the form
      await submitMutation.mutateAsync({
        veda,
        mantraNumber: validation.value!,
        template: buildTemplateText(),
      });
      
      setSubmitSuccess(true);
      
      // Close the editor after successful submission
      setTimeout(() => {
        setSubmitSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      // Error is handled by mutation
    }
  };

  return (
    <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Mantra Content Template</CardTitle>
            <CardDescription>
              {isOpen ? 'Fill in the content and submit to save' : 'Click Add to create or edit template'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!isOpen ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleAdd}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                  disabled={submitMutation.isPending}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="gap-2"
                  disabled={submitMutation.isPending}
                >
                  <X className="h-4 w-4" />
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-4">
          {isLoadingTemplate ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading template...
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="number">Number</Label>
                <Textarea
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Mantra number"
                  className="font-mono text-sm resize-none"
                  rows={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sanskrit">Sanskrit</Label>
                <Textarea
                  id="sanskrit"
                  value={sanskrit}
                  onChange={(e) => setSanskrit(e.target.value)}
                  placeholder="Sanskrit text"
                  className="font-mono text-sm"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transliteration">Transliteration</Label>
                <Textarea
                  id="transliteration"
                  value={transliteration}
                  onChange={(e) => setTransliteration(e.target.value)}
                  placeholder="Transliteration"
                  className="font-mono text-sm"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telugu">Telugu</Label>
                <Textarea
                  id="telugu"
                  value={telugu}
                  onChange={(e) => setTelugu(e.target.value)}
                  placeholder="Telugu text"
                  className="font-mono text-sm"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meaning">Meaning</Label>
                <Textarea
                  id="meaning"
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  placeholder="Meaning"
                  className="font-mono text-sm"
                  rows={4}
                />
              </div>

              <div className="border-t border-border/50 pt-4 mt-6">
                <h3 className="text-sm font-semibold mb-4 text-foreground">English</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="english-mantra">English Mantra</Label>
                    <Textarea
                      id="english-mantra"
                      value={englishMantra}
                      onChange={(e) => setEnglishMantra(e.target.value)}
                      placeholder="English mantra text"
                      className="font-mono text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="english-meaning">English Meaning</Label>
                    <Textarea
                      id="english-meaning"
                      value={englishMeaning}
                      onChange={(e) => setEnglishMeaning(e.target.value)}
                      placeholder="English meaning"
                      className="font-mono text-sm"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {validationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validationError}
                  </AlertDescription>
                </Alert>
              )}

              {submitSuccess && (
                <Alert className="bg-success/10 border-success/30">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    Submitted successfully.
                  </AlertDescription>
                </Alert>
              )}

              {submitMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {submitMutation.error?.message || 'Failed to submit template. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="w-full gap-2"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
