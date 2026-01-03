<script lang="ts">
	import AttachSegment from '$lib/components/attach-detach/AttachSegment.svelte';
	import IconLink from '$lib/components/icons/IconLink.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		ondetach: () => void;
	}

	let {ondetach}: Props = $props();

	let visible: boolean = $state(false);
</script>

<button class="menu" onclick={() => (visible = true)}><IconLink /> {$i18n.analytics.attach}</button>

<AttachSegment segment="orbiter" onsuccess={ondetach} bind:visible>
	{#snippet title()}
		{$i18n.analytics.attach}
	{/snippet}
	{#snippet input()}
		{$i18n.analytics.attach_id}
	{/snippet}
</AttachSegment>
