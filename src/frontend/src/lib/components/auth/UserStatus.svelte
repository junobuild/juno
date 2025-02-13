<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { User } from '$lib/types/user';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	let { data } = $derived(user);

	let { banned } = $derived(data);
</script>

{banned === 'indefinite' ? $i18n.users.banned : $i18n.users.active}
