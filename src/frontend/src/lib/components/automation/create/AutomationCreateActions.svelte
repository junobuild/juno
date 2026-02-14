<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import AutomationCreateActionsYaml, {
		type PackageManager,
		type WorkflowType
	} from '$lib/components/automation/create/AutomationCreateActionsYaml.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let workflow = $state<WorkflowType>('deploy');
	let pkgManager = $state<PackageManager>('npm');

	let workflowFile = $derived(`.github/workflows/${workflow}.yml`);
</script>

<h2>{$i18n.automation.create_actions_title}</h2>

<p>
	<Html
		text={i18nFormat($i18n.automation.create_actions_description, [
			{
				placeholder: '{0}',
				value: workflowFile
			}
		])}
	/>
</p>

<div class="columns">
	<div class="options">
		<Value>
			{#snippet label()}
				{$i18n.automation.workflow_type}
			{/snippet}

			<select bind:value={workflow}>
				<option value="deploy">{$i18n.automation.deploy_frontend}</option>
				<option value="publish">{$i18n.automation.publish_functions}</option>
			</select>
		</Value>

		<Value>
			{#snippet label()}
				{$i18n.automation.package_manager}
			{/snippet}

			<select bind:value={pkgManager}>
				<option value="npm">npm</option>
				<option value="yarn">yarn</option>
				<option value="pnpm">pnpm</option>
			</select>
		</Value>
	</div>

	<div class="snippet">
		<AutomationCreateActionsYaml {pkgManager} {workflow} />
	</div>
</div>

<div class="toolbar">
	<button onclick={onclose}>{$i18n.core.done}</button>
</div>

<style lang="scss">
	@use '../../../styles/mixins/grid';
	@use '../../../styles/mixins/media';

	select {
		width: fit-content;
	}

	.columns {
		padding: var(--padding-2x) 0 0;

		@include media.min-width(medium) {
			@include grid.four-columns;
		}
	}

	.options {
		grid-column: 1 / 2;
	}

	.snippet {
		grid-column: 2 / 5;
	}

	.toolbar {
		display: flex;
		justify-content: center;

		margin: var(--padding-4x) 0 0;
	}
</style>
