<script lang="ts" module>
	export type WorkflowType = 'deploy' | 'publish';
	export type PackageManager = 'npm' | 'yarn' | 'pnpm';
</script>

<script lang="ts">
	import Copy from '$lib/components/ui/Copy.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import deployNpm from '$lib/templates/actions-deploy-npm.yml?raw';
	import deployPnpm from '$lib/templates/actions-deploy-pnpm.yml?raw';
	import deployYarn from '$lib/templates/actions-deploy-yarn.yml?raw';
	import publishNpm from '$lib/templates/actions-publish-npm.yml?raw';
	import publishPnpm from '$lib/templates/actions-publish-pnpm.yml?raw';
	import publishYarn from '$lib/templates/actions-publish-yarn.yml?raw';

	interface Props {
		workflow: WorkflowType;
		pkgManager: PackageManager;
	}

	let { workflow, pkgManager }: Props = $props();

	let snippet = $derived(
		workflow === 'deploy'
			? pkgManager === 'npm'
				? deployNpm
				: pkgManager === 'yarn'
					? deployYarn
					: deployPnpm
			: pkgManager === 'npm'
				? publishNpm
				: pkgManager === 'yarn'
					? publishYarn
					: publishPnpm
	);

	let what = $derived(
		workflow === 'deploy' ? $i18n.automation.deploy_frontend : $i18n.automation.publish_functions
	);
</script>

<article>
	{snippet}

	<div class="copy"><Copy toastValue={false} value={snippet} {what} /></div>
</article>

<style lang="scss">
	@use '../../../../styles/mixins/shadow';
	@use '../../../../styles/mixins/media';

	article {
		position: relative;

		white-space: pre-wrap;

		padding: var(--padding-2x);
		margin: 0 var(--padding) 0 0;

		background: var(--color-card-contrast);
		color: var(--color-card);

		border-radius: var(--border-radius);

		font-size: var(--font-size-very-small);

		@include shadow.shadow;
	}

	@include media.dark-theme {
		article {
			background: var(--color-background);
			color: var(--color-background-contrast);

			border: 1px solid var(--color-primary);
		}
	}

	.copy {
		position: absolute;
		top: 0;
		right: 0;

		margin: var(--padding-2x);

		color: var(--text-color);
	}
</style>
