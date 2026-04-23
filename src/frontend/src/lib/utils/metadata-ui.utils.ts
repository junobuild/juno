import { MetadataDeserializer } from '$lib/schemas/metadata.schema';
import type { Metadata, MetadataUi, MetadataUiTags } from '$lib/types/metadata';
import { metadataEnvironment, metadataName, metadataTags } from '$lib/utils/metadata.utils';

export const metadataUi = <T extends { metadata: Metadata }>(obj: T): MetadataUi => ({
	name: metadataUiName(obj),
	environment: metadataUiEnvironment(obj),
	tags: metadataUiTags(obj)
});

export const metadataUiName = <T extends { metadata: Metadata }>({ metadata }: T): string =>
	metadataName(metadata);

export const metadataUiEnvironment = <T extends { metadata: Metadata }>({
	metadata
}: T): string | undefined => metadataEnvironment(metadata);

export const metadataUiTags = <T extends { metadata: Metadata }>({
	metadata
}: T): MetadataUiTags | undefined => {
	const tags = metadataTags(metadata);
	const { data, success } = MetadataDeserializer.safeParse(tags);
	return success ? data : undefined;
};
