<script lang="ts">
	import { fromNullable } from '@dfinity/utils';
	import type { SatelliteDid } from '$declarations';
	import RepositoryRef from '$lib/components/satellites/automation/repository/RepositoryRef.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toDocRepositoryKey } from '$lib/utils/workflow.utils';

	interface Props {
		config: SatelliteDid.OpenIdAutomationProviderConfig;
		openModal: (params: {
			type: 'edit_automation_keys_config' | 'edit_automation_connect_repository_config';
		}) => void;
	}

	let { config, openModal }: Props = $props();

	let repositories = $derived(config.repositories);

	let empty = $derived(repositories.length === 0);

	const openEditModal = () => openModal({ type: 'edit_automation_connect_repository_config' });
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="tools"></th>
				<th> {$i18n.automation.repository} </th>
				<th> {$i18n.automation.references}</th>
			</tr>
		</thead>

		<tbody>
			{#each repositories as repository, index (index)}
				{@const [key] = repository}
				{@const refs = fromNullable(repository[1].refs)}

				<tr>
					<td>TODO</td>
					<td>{toDocRepositoryKey(key)}</td>
					<td>
						<div class="refs">
							{#each refs as ref (ref)}
								<RepositoryRef {key} {ref} />
							{/each}
						</div>
					</td>
				</tr>
			{/each}

			{#if empty}
				<tr><td colspan="3">{$i18n.automation.empty_repositories}</td></tr>
			{/if}
		</tbody>
	</table>
</div>

<button onclick={openEditModal}>{$i18n.automation.connect_repository}</button>

<style lang="scss">
	.tools {
		width: 88px;
	}

	button {
		margin: 0 0 var(--padding-8x);
	}

	.refs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--padding);
	}
</style>
