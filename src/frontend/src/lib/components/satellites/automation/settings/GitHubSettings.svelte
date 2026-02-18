<script lang="ts">
	import type { Satellite } from '$lib/types/satellite';
	import type { SatelliteDid } from '$declarations';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toDocRepositoryKey } from '$lib/utils/workflow.utils';
	import RepositoryRef from '$lib/components/satellites/automation/RepositoryRef.svelte';
	import { fromNullable } from '@dfinity/utils';

	interface Props {
		satellite: Satellite;
		config: SatelliteDid.OpenIdAutomationProviderConfig;
	}

	let { satellite, config }: Props = $props();

	let repositories = $derived(config.repositories);

	let empty = $derived(repositories.length === 0);
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
				{@const key = repository[0]}
				{@const refs = fromNullable(repository[1].refs)}

				<tr>
					<td>TODO</td>
					<td>{toDocRepositoryKey(key)}</td>
					<td>
						{#each refs as ref (ref)}
							<RepositoryRef {key} {ref} />
						{/each}
					</td>
				</tr>
			{/each}

			{#if empty}
				<tr><td colspan="3">{$i18n.automation.empty_repositories}</td></tr>
			{/if}
		</tbody>
	</table>
</div>

<style lang="scss">
	.tools {
		width: 88px;
	}
</style>
