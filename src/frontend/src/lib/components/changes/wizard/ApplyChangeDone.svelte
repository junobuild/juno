<script lang="ts">
	import type { ProposalType } from '@junobuild/cdn';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		proposalType: ProposalType;
		onclose: () => void;
		startUpgrade: () => void;
	}

	let { onclose, startUpgrade, proposalType }: Props = $props();

	let segmentsDeployment = $derived('SegmentsDeployment' in proposalType);
</script>

<div class="msg">
	<p>
		{#if segmentsDeployment}
			{$i18n.changes.segments_deployment_applied}
		{:else}
			{$i18n.changes.assets_upgrade_applied}
		{/if}
	</p>

	<div class="actions">
		<button onclick={onclose}>{$i18n.core.close}</button>

		{#if segmentsDeployment}
			<button onclick={startUpgrade}>{$i18n.changes.upgrade_now}</button>
		{/if}
	</div>
</div>

<style lang="scss">
	@use '../../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--padding-2x);
	}
</style>
