<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import type { Principal } from '@dfinity/principal';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import type { OrbiterSatelliteConfigEntry } from '$lib/types/ortbiter';
	import Identifier from '$lib/components/ui/Identifier.svelte';

	interface Props {
		orbiterId: Principal;
		configuration: Record<SatelliteIdText, OrbiterSatelliteConfigEntry>;
		onclose: () => void;
	}

	let { orbiterId, configuration, onclose }: Props = $props();

	let steps: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');
</script>

<Modal on:junoClose={onclose}>
	{#if steps === 'ready'}
		<div class="msg">
			<p>{$i18n.analytics.ready}</p>
			<button onclick={close}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.analytics.initializing}</p>
		</SpinnerModal>
	{:else}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th class="tools"> {$i18n.analytics.enabled} </th>
						<th class="origin"> {$i18n.satellites.satellite} </th>
						<th class="origin"> {$i18n.satellites.id} </th>
					</tr>
				</thead>
				<tbody>
					{#each Object.entries(configuration) as conf}
						{@const satelliteId = conf[0]}
						{@const entry = conf[1]}

						<tr>
							<td class="actions">
								<input type="checkbox" bind:checked={conf[1].enabled} />
							</td>

							<td>
								{entry.name}
							</td>

							<td>
								<Identifier identifier={satelliteId} shorten={false} small={false} />
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</Modal>

<style lang="scss">
	.tools {
		width: 88px;
	}

	input[type='checkbox'] {
		margin: 0;
	}
</style>
