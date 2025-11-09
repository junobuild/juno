<script lang="ts">
	import { getContext, onDestroy } from 'svelte';
	import { run } from 'svelte/legacy';
	import IconAutoRenew from '$lib/components/icons/IconAutoRenew.svelte';
	import IconMore from '$lib/components/icons/IconMore.svelte';
	import IconTimer from '$lib/components/icons/IconTimer.svelte';
	import IconTimerOff from '$lib/components/icons/IconTimerOff.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import { SYNC_LOGS_TIMER_INTERVAL } from '$lib/constants/app.constants';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Log as LogType } from '$lib/types/log';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import { getLocalStorageObserveLogs, setLocalStorageItem } from '$lib/utils/local-storage.utils';

	const { list, resetPage }: PaginationContext<LogType> =
		getContext<PaginationContext<LogType>>(PAGINATION_CONTEXT_KEY);

	const reload = async () => {
		visible = false;

		resetPage();
		await list();
	};

	let observe = $state(getLocalStorageObserveLogs());
	let timer: number | undefined;

	const saveToggle = () =>
		setLocalStorageItem({ key: 'observe_logs', value: JSON.stringify(observe) });

	const watch = () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore NodeJS.timeout vs number
		timer = setInterval(async () => {
			await list();
		}, SYNC_LOGS_TIMER_INTERVAL);
	};

	const unwatch = () => clearInterval(timer);

	const toggle = () => {
		if (!observe) {
			unwatch();
			return;
		}

		watch();
	};

	const onToggle = () => {
		observe = !observe;
		saveToggle();
	};

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		(observe, toggle());
	});

	onDestroy(unwatch);

	interface Props {
		visible?: boolean | undefined;
	}

	let { visible = $bindable(false) }: Props = $props();

	let button: HTMLButtonElement | undefined = $state();
</script>

<button
	bind:this={button}
	class="icon"
	aria-label={$i18n.core.more}
	onclick={() => (visible = true)}
	type="button"><IconMore size="20px" /></button
>

<Popover anchor={button} direction="ltr" bind:visible>
	<div class="container">
		<button class="menu" onclick={reload} type="button"
			><IconAutoRenew /> {$i18n.core.refresh}</button
		>

		<button class="menu" onclick={onToggle} type="button"
			>{#if observe}<IconTimer /> {$i18n.functions.auto_refresh_enabled}{:else}<IconTimerOff
					size="20px"
				/>
				{$i18n.functions.auto_refresh_disabled}{/if}
		</button>
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	button.icon {
		padding: 0;
	}

	button.menu {
		text-align: left;
	}
</style>
