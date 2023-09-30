<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import { onMount } from 'svelte';
	import type { Languages } from '$lib/types/languages';

	export let selected: Languages;

	onMount(() => (selected = $i18n.lang));
</script>

<Value>
	<svelte:fragment slot="label">{$i18n.core.language}</svelte:fragment>
	<select bind:value={selected} on:change={async () => await i18n.switchLang(selected)}>
		<option value="en"> English </option>
		<option value="zh-cn"> 简体中文 </option>
		<option value="it"> Italiano </option>
	</select>
</Value>

<style lang="scss">
	select {
		width: fit-content;
	}
</style>
