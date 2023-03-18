export const metadataName = (metadata: [string, string][]): string =>
    new Map(metadata).get('name') ?? '';