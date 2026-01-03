<script lang="ts">
	import AttachSegment from '$lib/components/attach-detach/AttachSegment.svelte';
	import IconLink from '$lib/components/icons/IconLink.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		ondetach: () => void;
	}

	let { ondetach }: Props = $props();

	let visible = $state(false);
</script>

<button class="menu" onclick={() => (visible = true)}><IconLink /> {$i18n.satellites.attach}</button
>

<AttachSegment onsuccess={ondetach} segment="satellite" bind:visible>
	{#snippet title()}
		{$i18n.satellites.attach}
	{/snippet}
	{#snippet input()}
		{$i18n.satellites.id}
	{/snippet}
</AttachSegment>
