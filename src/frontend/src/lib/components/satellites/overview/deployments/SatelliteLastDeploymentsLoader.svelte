<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Satellite } from '$lib/types/satellite';
	import type { Workflow, WorkflowKey } from '$lib/types/workflow';
	import type { Option } from '$lib/types/utils';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { satelliteAutomationConfig } from '$lib/derived/satellite/satellite-configs.derived';
	import { type Snippet, untrack } from 'svelte';
	import { listLastWorkflows } from '$lib/services/satellite/automation/workflows.services';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { isNullish } from '@dfinity/utils';
	import { versionStore } from '$lib/stores/version.store';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { deploymentsLink } from '$lib/utils/nav.utils';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';

	interface Props {
		satellite: Satellite;
		content: Snippet<[[WorkflowKey, Workflow][]]>;
	}

	let { satellite, content }: Props = $props();

	let satelliteId = $derived(satellite.satellite_id);

	let workflows = $state<Option<[WorkflowKey, Workflow][]>>(undefined);

	const load = async () => {
		const version = $versionStore?.satellites[satelliteId.toText()]?.current;

		if (isNullish(version)) {
			workflows = undefined;
			return;
		}

		if ($satelliteAutomationConfig === undefined) {
			workflows = undefined;
			return;
		}

		if ($satelliteAutomationConfig === null) {
			workflows = null;
			return;
		}

		try {
			workflows = await listLastWorkflows({
				identity: $authIdentity,
				satelliteId
			});
		} catch (err: unknown) {
			toasts.error({
				text: 'sddfsdf',
				detail: err
			});
		}
	};

	$effect(() => {
		satelliteId;
		$versionStore;
		$satelliteAutomationConfig;

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
			text={i18nFormat($i18n.automation.no_deployments_yet, [
				{
					placeholder: '{0}',
					value: deploymentsLink(satelliteId)
				}
			])}
		/>
	</p>
{:else}
	<div in:fade>
		{@render content(workflows)}
	</div>
{/if}
