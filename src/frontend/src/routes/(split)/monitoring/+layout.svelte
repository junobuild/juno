<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutSatellitesSwitcher, layoutTitle } from '$lib/stores/layout.store';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		layoutTitle.set({
			title: $i18n.observatory.title,
			icon: IconTelescope
		});

		layoutSatellitesSwitcher.set(false);
	});
</script>

{@render children()}
