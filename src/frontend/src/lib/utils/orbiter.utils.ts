import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { metadataName } from '$lib/utils/metadata.utils';

export const orbiterName = ({ metadata }: Orbiter): string => metadataName(metadata);
