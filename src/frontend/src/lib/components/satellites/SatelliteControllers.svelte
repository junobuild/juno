<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { onMount } from 'svelte';
	import { listControllers } from '$lib/api/satellites.api';
	import type { Principal } from '@dfinity/principal';
	import { toasts } from '$lib/stores/toasts.store';

	export let satellite: Satellite;

	let controllers: Principal[] = [];

	onMount(async () => {
		try {
			controllers = await listControllers({ satelliteId: satellite.satellite_id });
		} catch (err: unknown) {
			toasts.error({
				text: `Error while listing the controllers.`,
				detail: err
			});
		}
	});
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th> Controllers </th>
				<th class="actions" />
			</tr>
		</thead>
		<tbody>
			{#each controllers as controller (controller.toText())}
				<tr><td>{controller.toText()}</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<style lang="scss">
	.actions {
		width: 68px;

		:global(a) {
			vertical-align: text-bottom;
		}
	}
</style>
