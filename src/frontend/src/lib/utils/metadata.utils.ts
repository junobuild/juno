import {
	METADATA_KEY_EMAIL,
	METADATA_KEY_ENVIRONMENT,
	METADATA_KEY_NAME,
	METADATA_KEY_PROFILE
} from '$lib/constants/metadata.constants';
import type { Metadata } from '$lib/types/metadata';

export const metadataName = (metadata: Metadata): string =>
	metadataKey({ metadata, key: METADATA_KEY_NAME }) ?? '';

export const metadataProfile = (metadata: Metadata): string =>
	metadataKey({ metadata, key: METADATA_KEY_PROFILE }) ?? '';

export const metadataEmail = (metadata: Metadata): string | undefined =>
	metadataKey({ metadata, key: METADATA_KEY_EMAIL });

export const metadataEnvironment = (metadata: Metadata): string | undefined =>
	metadataKey({ metadata, key: METADATA_KEY_ENVIRONMENT });

const metadataKey = ({ metadata, key }: { metadata: Metadata; key: string }): string | undefined =>
	new Map(metadata).get(key);
