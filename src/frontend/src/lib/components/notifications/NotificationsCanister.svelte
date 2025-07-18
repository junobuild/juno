<script lang="ts">
	import type { Component } from 'svelte';
	import CanisterIndicator from '$lib/components/canister/CanisterIndicator.svelte';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import Notification from '$lib/components/notifications/Notification.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData } from '$lib/types/canister';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		cyclesWarning: boolean;
		cyclesIcon: Component;
		heapWarning: boolean;
		data: CanisterData | undefined;
		close: () => void;
		href: string;
		segment: 'satellite' | 'mission_control' | 'orbiter';
	}

	let { cyclesWarning, heapWarning, close, data, href, cyclesIcon, segment }: Props = $props();
</script>

{#if !cyclesWarning}
	<Notification {href} {close}>
		{#snippet icon()}
			{@const SvelteComponent = cyclesIcon}
			<SvelteComponent size="32px" />
		{/snippet}

		{#snippet badge()}
			<CanisterIndicator {data} />
		{/snippet}

		{i18nFormat($i18n.notifications.low_cycles, [
			{
				placeholder: '{0}',
				value: segment.replace('_', ' ')
			}
		])}
	</Notification>
{/if}

{#if !heapWarning}
	<Notification {href} {close}>
		{#snippet icon()}
			<IconWarning size="32px" />
		{/snippet}

		{i18nFormat($i18n.notifications.heap, [
			{
				placeholder: '{0}',
				value: segment.replace('_', ' ')
			}
		])}
	</Notification>
{/if}
