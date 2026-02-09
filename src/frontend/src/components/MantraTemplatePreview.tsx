import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface MantraTemplatePreviewProps {
  template: string;
}

export function MantraTemplatePreview({ template }: MantraTemplatePreviewProps) {
  return (
    <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Template Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {template}
        </p>
      </CardContent>
    </Card>
  );
}
