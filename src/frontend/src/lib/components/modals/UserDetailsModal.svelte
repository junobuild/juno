<script lang="ts">
	import UserProvider from '$lib/components/auth/UserProvider.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalShowUserDetail } from '$lib/types/modal';
	import { formatToDate } from '$lib/utils/date.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { user, usages } = $derived(detail as JunoModalShowUserDetail);

	let { owner, created_at, updated_at } = $derived(user);
</script>

<Modal on:junoClose={onclose}>
	<h2>{$i18n.users.user_details}</h2>

	<div class="card-container columns-3 no-border">
		<div>
			<Value>
				{#snippet label()}
					{$i18n.users.identifier}
				{/snippet}
				<Identifier small={false} identifier={owner.toText()} />
			</Value>

			<Value>
				{#snippet label()}
					{$i18n.users.provider}
				{/snippet}
				<p class="provider"><UserProvider {user} withText /></p>
			</Value>
		</div>

		<div class="timestamps">
			<Value>
				{#snippet label()}
					{$i18n.users.created}
				{/snippet}
				<p>{formatToDate(created_at)}</p>
			</Value>

			<Value>
				{#snippet label()}
					{$i18n.users.updated}
				{/snippet}
				<p>{formatToDate(updated_at)}</p>
			</Value>
		</div>

		{#if usages.length > 0}
			<div class="chart">
				<Value>
					{#snippet label()}
						{$i18n.core.usage}
					{/snippet}

					<div class="table-container">
						<table>
							<thead>
								<tr>
									<th> {$i18n.collections.title} </th>
									<th> {$i18n.users.persistence} </th>
									<th> {$i18n.users.changes} </th>
								</tr>
							</thead>

							<tbody>
								{#each usages as usage}
									<tr>
										<td>{usage.collection}</td>
										<td
											>{'Db' in usage.collectionType
												? $i18n.datastore.title
												: $i18n.storage.title}</td
										>
										<td>{usage.usage?.changes_count ?? 0}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Value>
			</div>
		{/if}
	</div>
</Modal>

<style lang="scss">
	@use '../../styles/mixins/media';

	.card-container {
		padding: var(--padding-2x) var(--padding-2x) 0 0;
	}

	.provider {
		display: inline-flex;
		gap: var(--padding);
	}

	.timestamps {
		grid-column: 2 / 4;
	}

	.chart {
		grid-column: 1 / 4;
		margin: var(--padding-2x) 0;
	}

	.table-container {
		margin: var(--padding) 0 0;
	}
</style>
