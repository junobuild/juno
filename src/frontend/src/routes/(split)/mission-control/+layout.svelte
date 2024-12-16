<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { layoutNavigation } from '$lib/stores/layout-navigation.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() =>
		layoutNavigation.set({
			title: $i18n.mission_control.title,
			icon: IconMissionControl
		})
	);
</script>

{@render children()}
