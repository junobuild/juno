<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { User } from '$lib/types/user';
	import IconBlock from '$lib/components/icons/IconBlock.svelte';

	interface Props {
		user: User;
	}

	let { user }: Props = $props();

	let { data } = $derived(user);

	let { banned } = $derived(data);
</script>

{#if banned === 'indefinitely'}
	<span transition:fade><IconBlock size="20px" /></span>
{/if}
