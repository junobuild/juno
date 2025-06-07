<script lang="ts">
	import IconJuno from '$lib/components/icons/IconJuno.svelte';
	import IconJunoLogo from '$lib/components/icons/IconJunoLogo.svelte';
	import IconUser from '$lib/components/icons/IconUser.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { VersionMetadata } from '$lib/stores/version.store';
	import ButtonIcon from "$lib/components/ui/ButtonIcon.svelte";
	import IconArrowCircleUp from "$lib/components/icons/IconArrowCircleUp.svelte";

	interface Props {
		segmentLabel: string;
		version: Pick<VersionMetadata, 'current' | 'release'>;
		source: 'juno' | 'dev';
	}

	let { segmentLabel, version, source }: Props = $props();
</script>

<tr>
	<td>
		<ButtonIcon {onclick}>
			{#snippet icon()}
				<IconArrowCircleUp />
			{/snippet}

			{$i18n.canisters.upgrade}
		</ButtonIcon>
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
</style>
