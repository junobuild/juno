<script lang="ts">
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<SpinnerParagraph>{$i18n.signer.idle_waiting}</SpinnerParagraph>
