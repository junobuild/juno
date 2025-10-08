import type { MissionControlDid } from '$declarations';
import { getReleasesMetadata } from '$lib/services/cdn.services';
import { busy } from '$lib/stores/busy.store';
import { i18n } from '$lib/stores/i18n.store';
import { toasts } from '$lib/stores/toasts.store';
import { emit } from '$lib/utils/events.utils';
import { isNullish, nonNullish } from '@dfinity/utils';
import type { BuildType } from '@junobuild/admin';
import { compare } from 'semver';
import { get } from 'svelte/store';

export const openUpgradeModal = async ({
	currentVersion,
	type,
	satellite,
	build
}: {
	currentVersion: string;
	type: 'upgrade_satellite' | 'upgrade_mission_control' | 'upgrade_orbiter';
	satellite?: MissionControlDid.Satellite;
	build?: BuildType;
}) => {
	busy.start();

	const { result, error } = await newerReleases({
		currentVersion,
		segments:
			type === 'upgrade_mission_control'
				? 'mission_controls'
				: type === 'upgrade_orbiter'
					? 'orbiters'
					: 'satellites'
	});

	busy.stop();

	if (nonNullish(error) || isNullish(result)) {
		return;
	}

	emit({
		message: 'junoModal',
		detail: {
			type,
			detail: {
				...(nonNullish(satellite) && { satellite }),
				currentVersion,
				newerReleases: result,
				build
			}
		}
	});
};

const newerReleases = async ({
	currentVersion,
	segments
}: {
	currentVersion: string;
	segments: 'mission_controls' | 'satellites' | 'orbiters';
}): Promise<{ result: string[] | undefined; error?: unknown }> => {
	try {
		const metadata = await getReleasesMetadata();

		return {
			result: metadata[segments].filter((version) => compare(currentVersion, version) === -1)
		};
	} catch (error: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.upgrade_load_versions,
			detail: error
		});

		return { result: undefined, error };
	}
};
