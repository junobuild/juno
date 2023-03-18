export const metadataName = (metadata: [string, string][]): string =>
	metadataKey({ metadata, key: 'name' });

export const metadataProfile = (metadata: [string, string][]): string =>
	metadataKey({ metadata, key: 'profile' });

const metadataKey = ({ metadata, key }: { metadata: [string, string][]; key: string }): string =>
	new Map(metadata).get(key) ?? '';
