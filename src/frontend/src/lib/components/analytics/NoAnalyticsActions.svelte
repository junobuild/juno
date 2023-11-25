<script lang="ts">
	import Actions from '$lib/components/core/Actions.svelte';
	import NoAnalyticsAttach from '$lib/components/analytics/NoAnalyticsAttach.svelte';

	let visible: boolean | undefined;
</script>

<Actions bind:visible>
	<NoAnalyticsAttach on:junoAttach={() => visible = false} />
</Actions>
