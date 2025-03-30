<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
</script>

<SpinnerParagraph>{$i18n.signer.idle_waiting}</SpinnerParagraph>
