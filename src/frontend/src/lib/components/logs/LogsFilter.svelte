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

<PopoverApply ariaLabel={$i18n.sort.title} onapply={apply} bind:visible direction="ltr">
	{#snippet icon()}
		<IconFilter size="20px" />
	{/snippet}

	<p class="category sort">{$i18n.functions.levels}</p>

	<CheckboxGroup>
		<Checkbox>
			<input type="checkbox" bind:group={levels} value="Info" id="info" /><label for="info"
				><span>{$i18n.functions.info}</span></label
			>
		</Checkbox>

		<Checkbox>
			<input type="checkbox" bind:group={levels} value="Debug" id="debug" /><label for="debug"
				><span>{$i18n.functions.debug}</span></label
			>
		</Checkbox>

		<Checkbox>
			<input type="checkbox" bind:group={levels} value="Warning" id="warning" /><label for="warning"
				><span>{$i18n.functions.warning}</span></label
			>
		</Checkbox>

		<Checkbox>
			<input type="checkbox" bind:group={levels} value="Error" id="error" /><label for="error"
				><span>{$i18n.functions.error}</span></label
			>
		</Checkbox>

		<Checkbox>
			<input type="checkbox" bind:group={levels} value="Unknown" id="unknown" /><label for="unknown"
				><span>{$i18n.functions.unknown}</span></label
			>
		</Checkbox>
	</CheckboxGroup>
</PopoverApply>

<style lang="scss">
	@use '../../styles/mixins/dialog';

	@include dialog.apply;
</style>
