<script lang="ts">
	import Html from '$lib/components/ui/Html.svelte';
	import Info from '$lib/components/ui/Info.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
</script>

<Info>
	{#snippet icon()}
		<span>👋</span>
	{/snippet}

	<Html text={$i18n.launchpad.getting_started_credits} />
</Info>

<style lang="scss">
	span {
		font-size: 32px;
	}
</style>
