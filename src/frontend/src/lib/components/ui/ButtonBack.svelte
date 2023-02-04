<script lang="ts">
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import { back } from '$lib/utils/nav.utils';
	import IconBack from '$lib/components/icons/IconBack.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<ButtonIcon on:click={back}>
	<IconBack slot="icon" />
	{$i18n.core.back}
</ButtonIcon>
