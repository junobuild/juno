<script lang="ts">
	import { fade } from 'svelte/transition';
	import IconBlock from '$lib/components/icons/IconBlock.svelte';
	import type { User } from '$lib/types/user';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	let { data } = $derived(user);

	let { banned } = $derived(data);
</script>

{#if banned === 'indefinite'}
	<span transition:fade><IconBlock size="20px" /></span>
{/if}
