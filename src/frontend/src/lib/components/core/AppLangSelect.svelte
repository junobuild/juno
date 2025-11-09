<script lang="ts">
	import { onMount } from 'svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { Languages } from '$lib/types/languages';

	interface Props {
		selected: Languages;
	}

	let { selected = $bindable() }: Props = $props();

	onMount(() => (selected = $i18n.lang));
</script>

<Value>
	{#snippet label()}
		{$i18n.core.language}
	{/snippet}
	<select onchange={async () => await i18n.switchLang(selected)} bind:value={selected}>
		<option value="en"> English </option>
		<option value="zh-cn"> 简体中文 </option>
	</select>
</Value>

<style lang="scss">
	select {
		width: fit-content;
	}
</style>
