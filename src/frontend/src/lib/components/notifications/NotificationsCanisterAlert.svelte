<script lang="ts">
	import type { Component } from 'svelte';
	import CanisterIndicator from '$lib/components/canister/CanisterIndicator.svelte';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import NotificationLink from '$lib/components/notifications/NotificationLink.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData, CanisterWarning } from '$lib/types/canister';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		warnings: CanisterWarning | undefined;
		cyclesIcon: Component;
		data: CanisterData | undefined;
		close: () => void;
		href: string;
		segment: 'satellite' | 'mission_control' | 'orbiter';
	}

	let { warnings, close, data, href, cyclesIcon, segment }: Props = $props();

	let cyclesWarning = $derived(warnings?.cycles === true);
	let heapWarning = $derived(warnings?.heap === true);
</script>

{#if cyclesWarning}
	<NotificationLink {href} {close}>
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
	</NotificationLink>
{/if}

{#if heapWarning}
	<NotificationLink {href} {close}>
		{#snippet icon()}
			<IconWarning size="32px" />
		{/snippet}

		{i18nFormat($i18n.notifications.heap, [
			{
				placeholder: '{0}',
				value: segment.replace('_', ' ')
			}
		])}
	</NotificationLink>
{/if}
