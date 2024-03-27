<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import PopoverApply from '$lib/components/ui/PopoverApply.svelte';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';
	import type { Log as LogType, LogLevel } from '$lib/types/log';
	import { getContext } from 'svelte';
	import IconFilter from '$lib/components/icons/IconFilter.svelte';

	export let levels: LogLevel[];

	let visible: boolean | undefined;

	const { list }: PaginationContext<LogType> =
		getContext<PaginationContext<LogType>>(PAGINATION_CONTEXT_KEY);

	const apply = async () => {
		await list();

		visible = false;
	};
</script>

<PopoverApply ariaLabel={$i18n.sort.title} on:click={apply} bind:visible>
	<IconFilter size="20px" slot="icon" />

	<p class="category sort">{$i18n.functions.levels}</p>

	<div class="checkbox">
		<input type="checkbox" bind:group={levels} value={'Info'} id="info" /><label for="info"
			><span>{$i18n.functions.info}</span></label
		>
	</div>

	<div class="checkbox">
		<input type="checkbox" bind:group={levels} value={'Debug'} id="debug" /><label for="debug"
			><span>{$i18n.functions.debug}</span></label
		>
	</div>

	<div class="checkbox">
		<input type="checkbox" bind:group={levels} value={'Warning'} id="warning" /><label for="warning"
			><span>{$i18n.functions.warning}</span></label
		>
	</div>

	<div class="checkbox">
		<input type="checkbox" bind:group={levels} value={'Error'} id="error" /><label for="error"
			><span>{$i18n.functions.error}</span></label
		>
	</div>
</PopoverApply>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.apply;

	.checkbox {
		display: flex;
		align-items: center;
		gap: var(--padding-2x);

		label {
			padding-bottom: 2px;
		}
	}
</style>
