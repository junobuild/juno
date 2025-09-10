import type { SatelliteMetadataParser, SatelliteMetadataSchema } from '$lib/schemas/mission-control';
import type { Principal } from '@dfinity/principal';
import type * as z from 'zod/v4';

export type MissionControlId = Principal;

export type SatelliteTags = z.infer<typeof SatelliteMetadataParser>;
export type SatelliteMetadata = z.infer<typeof SatelliteMetadataSchema>;
