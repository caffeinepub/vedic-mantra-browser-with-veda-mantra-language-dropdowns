import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useBackendDiagnostics } from '../hooks/useQueries';
import { CheckCircle2, XCircle, Database } from 'lucide-react';

export function DiagnosticsPanel() {
  const { data: diagnostics, isLoading, error } = useBackendDiagnostics();

  return (
    <details className="group">
      <summary className="cursor-pointer list-none">
        <Card className="shadow-sm border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Backend Diagnostics
              <span className="ml-auto text-xs text-muted-foreground group-open:hidden">
                (click to expand)
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      </summary>
      
      <Card className="mt-2 shadow-sm border-border/50 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backend Data Status
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time backend state for debugging
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">
                Failed to load diagnostics. Please refresh the page or check your connection.
              </AlertDescription>
            </Alert>
          ) : diagnostics ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Mantras</p>
                  <p className="font-mono font-semibold">{diagnostics.mantraCount.toString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Metadata Entries</p>
                  <p className="font-mono font-semibold">{diagnostics.metadataCount.toString()}</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Samaveda Status</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {diagnostics.samaveda47Exists ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className="text-xs">
                      Mantra 47: {diagnostics.samaveda47Exists ? 'Present' : 'Missing'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {diagnostics.samaveda48Exists ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    <span className="text-xs">
                      Mantra 48: {diagnostics.samaveda48Exists ? 'Present' : 'Missing'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </details>
  );
}
