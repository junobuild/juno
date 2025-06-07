<script lang="ts">
	import IconArrowCircleUp from '$lib/components/icons/IconArrowCircleUp.svelte';
	import IconJuno from '$lib/components/icons/IconJuno.svelte';
	import IconJunoLogo from '$lib/components/icons/IconJunoLogo.svelte';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { VersionMetadata } from '$lib/stores/version.store';

	interface Props {
		segmentLabel: string;
		version: Pick<VersionMetadata, 'current' | 'release'>;
		source: 'juno' | 'dev';
		startUpgrade: () => Promise<void>;
	}

	let { segmentLabel, version, source, startUpgrade }: Props = $props();
</script>

<tr>
	<td>
		<button class="square" aria-label={$i18n.canisters.upgrade} onclick={startUpgrade}
			><IconArrowCircleUp size="20px" /></button
		>
	</td>
	<td>{segmentLabel}</td>
	<td>{version.current}</td>
	<td>{version.release}</td>
	<td>
		{#if source === 'dev'}
			<IconUser size="14px" />
			<span class="visually-hidden">{$i18n.upgrade_dock.dev}</span>
		{:else}
			<IconJunoLogo size="14px" />
			<span class="visually-hidden">Juno</span>
		{/if}
	</td></tr
>

<style lang="scss">
	@use '../../styles/mixins/a11y';

	.visually-hidden {
		@include a11y.visually-hidden;
	}

	button {
		vertical-align: middle;
	}
</style>
