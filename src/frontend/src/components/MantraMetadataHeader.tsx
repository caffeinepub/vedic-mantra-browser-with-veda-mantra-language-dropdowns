interface MantraMetadataHeaderProps {
  metadata: string;
}

/**
 * Renders mantra metadata with emphasized labels (tokens ending with ':')
 * and a light-green tinted background. The component preserves the exact
 * backend-provided text and applies visual styling only.
 */
export function MantraMetadataHeader({ metadata }: MantraMetadataHeaderProps) {
  // Split metadata into tokens by spaces while preserving the original text
  const tokens = metadata.split(/(\s+)/);

  return (
    <div className="metadata-header-container p-4 rounded-lg bg-metadata-bg border border-metadata-border">
      <p className="text-sm leading-relaxed text-foreground/90 flex flex-wrap gap-x-1">
        {tokens.map((token, index) => {
          // Check if token ends with ':' (label)
          const isLabel = token.trim().endsWith(':');
          
          return (
            <span
              key={index}
              className={isLabel ? 'metadata-label font-semibold text-metadata-label' : ''}
            >
              {token}
            </span>
          );
        })}
      </p>
    </div>
  );
}
