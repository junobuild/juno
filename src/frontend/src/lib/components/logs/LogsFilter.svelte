<script lang="ts">
	import { getContext } from 'svelte';
	import IconFilter from '$lib/components/icons/IconFilter.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import CheckboxGroup from '$lib/components/ui/CheckboxGroup.svelte';
	import PopoverApply from '$lib/components/ui/PopoverApply.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Log as LogType, LogLevel } from '$lib/types/log';
	import { PAGINATION_CONTEXT_KEY, type PaginationContext } from '$lib/types/pagination.context';

	interface Props {
		levels: LogLevel[];
	}

	let { levels = $bindable() }: Props = $props();

	let visible: boolean = $state(false);

	const { list }: PaginationContext<LogType> =
		getContext<PaginationContext<LogType>>(PAGINATION_CONTEXT_KEY);

	const apply = async () => {
		await list();

		visible = false;
	};
</script>

<PopoverApply ariaLabel={$i18n.sort.title} direction="ltr" onapply={apply} bind:visible>
	{#snippet icon()}
		<IconFilter size="20px" />
	{/snippet}

	<p class="category sort">{$i18n.functions.levels}</p>

	<CheckboxGroup>
		<Checkbox>
			<input id="info" type="checkbox" value="Info" bind:group={levels} /><label for="info"
				><span>{$i18n.functions.info}</span></label
			>
		</Checkbox>

		<Checkbox>
			<input id="debug" type="checkbox" value="Debug" bind:group={levels} /><label for="debug"
				><span>{$i18n.functions.debug}</span></label
			>
		</Checkbox>

		<Checkbox>
			<input id="warning" type="checkbox" value="Warning" bind:group={levels} /><label for="warning"
				><span>{$i18n.functions.warning}</span></label
			>
		</Checkbox>

		<Checkbox>
			<input id="error" type="checkbox" value="Error" bind:group={levels} /><label for="error"
				><span>{$i18n.functions.error}</span></label
			>
		</Checkbox>

		<Checkbox>
			<input id="unknown" type="checkbox" value="Unknown" bind:group={levels} /><label for="unknown"
				><span>{$i18n.functions.unknown}</span></label
			>
		</Checkbox>
	</CheckboxGroup>
</PopoverApply>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.apply;
</style>
