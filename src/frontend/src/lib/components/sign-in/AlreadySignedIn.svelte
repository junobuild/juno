<script lang="ts">
	import NotFound from '$lib/components/ui/NotFound.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

<NotFound warnText={$i18n.sign_in_openid.already_signed_in} />
