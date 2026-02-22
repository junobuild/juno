<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { type Snippet, untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import Html from '$lib/components/ui/Html.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import { satelliteAutomationConfig } from '$lib/derived/satellite/satellite-configs.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { workflowsCertifiedStore } from '$lib/stores/workflows/workflows.store';
	import type { Satellite } from '$lib/types/satellite';
	import type { Option } from '$lib/types/utils';
	import type { CertifiedWorkflows } from '$lib/types/workflow';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { deploymentsLink } from '$lib/utils/nav.utils';

	interface Props {
		satellite: Satellite;
		content: Snippet<[CertifiedWorkflows]>;
	}

	let { satellite, content }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id);

	let workflows = $state<Option<CertifiedWorkflows>>(undefined);

	const load = () => {
		if ($satelliteAutomationConfig === undefined) {
			workflows = undefined;
			return;
		}

		if ($satelliteAutomationConfig === null) {
			workflows = null;
			return;
		}

		workflows = $workflowsCertifiedStore?.[satelliteId.toText()]?.GitHub?.slice(0, 3);
	};

	$effect(() => {
		satelliteId;
		$satelliteAutomationConfig;
		$workflowsCertifiedStore;

		untrack(load);
	});
</script>

{#if workflows === undefined}
	<SkeletonText tagName="p" />
	<SkeletonText />
	<SkeletonText />
{:else if workflows === null}
	<p in:fade>
		<Html
			text={i18nFormat(
				isNullish($satelliteAutomationConfig)
					? $i18n.automation.deployments_not_configured
					: $i18n.automation.no_deployments_yet,
				[
					{
						placeholder: '{0}',
						value: deploymentsLink(satelliteId)
					}
				]
			)}
		/>
	</p>
{:else}
	<div in:fade>
		{@render content(workflows)}
	</div>
{/if}
