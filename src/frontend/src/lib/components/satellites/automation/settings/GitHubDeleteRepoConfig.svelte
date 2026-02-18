<script lang="ts">
	import ButtonTableAction from '$lib/components/ui/ButtonTableAction.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { RepositoryKey } from '$declarations/satellite/satellite.did';
	import Value from '$lib/components/ui/Value.svelte';
	import Confirmation from '$lib/components/app/core/Confirmation.svelte';
	import { toDocRepositoryKey } from '$lib/utils/workflow.utils';
	import { i18nFormat } from '$lib/utils/i18n.utils';
	import Html from "$lib/components/ui/Html.svelte";

	interface Props {
		key: RepositoryKey;
	}

	let { key }: Props = $props();

	let visibleDelete = $state(false);

	const close = () => (visibleDelete = false);

	const deleteRepoConfig = async () => {};
</script>

<ButtonTableAction
	ariaLabel={$i18n.core.delete}
	icon="delete"
	onaction={() => (visibleDelete = true)}
/>

<Confirmation size="wide" bind:visible={visibleDelete} on:junoYes={deleteRepoConfig} on:junoNo={close}>
	{#snippet title()}
		{$i18n.automation.delete_title}
	{/snippet}

	<p>
		<Html text={i18nFormat($i18n.automation.delete_question, [
			{
				placeholder: '{0}',
				value: toDocRepositoryKey(key)
			}
		])} />
	</p>
</Confirmation>

<style lang="scss">
	p {
		white-space: pre-wrap;

		margin: 0 0 var(--padding-3x);
	}
</style>
