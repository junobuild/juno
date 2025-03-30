<script lang="ts">
	import { run, stopPropagation } from 'svelte/legacy';
	import Json from './Json.svelte';

	import { i18n } from '$lib/stores/i18n.store';
	import { isHash, stringifyJson, isPrincipal } from '$lib/utils/json.utils';
	import { handleKeyPress } from '$lib/utils/keyboard.utils';

	interface Props {
		json?: unknown | undefined;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		defaultExpandedLevel?: any;
		_key?: string;
		_level?: number;
		_collapsed?: boolean | undefined;
	}

	let {
		json = undefined,
		defaultExpandedLevel = Infinity,
		_key = '',
		_level = 1,
		_collapsed = undefined
	}: Props = $props();

	type ValueType =
		| 'bigint'
		| 'boolean'
		| 'function'
		| 'null'
		| 'number'
		| 'object'
		| 'principal'
		| 'hash'
		| 'string'
		| 'symbol'
		| 'undefined';

	const getValueType = (value: unknown): ValueType => {
		if (value === null) {
			return 'null';
		}
		if (isPrincipal(value)) {
			return 'principal';
		}
		if (Array.isArray(json) && isHash(json)) {
			return 'hash';
		}
		return typeof value;
	};

	let valueType: ValueType | undefined = $state();
	let value: unknown = $state();
	let keyLabel: string | undefined = $state();
	let children: [string, unknown][] = $state([]);
	let hasChildren: boolean | undefined = $state();
	let isExpandable: boolean | undefined = $state();
	let isArray: boolean | undefined = $state();
	let openBracket: string | undefined = $state();
	let closeBracket: string | undefined = $state();
	let root: boolean | undefined = $state();
	let testId: 'json' | undefined = $state();
	run(() => {
		valueType = getValueType(json);
		isExpandable = valueType === 'object';
		value = isExpandable ? json : stringifyJson(json);
		keyLabel = `${_key}${_key.length > 0 ? ': ' : ''}`;
		children = isExpandable ? Object.entries(json as object) : [];
		hasChildren = children.length > 0;
		isArray = Array.isArray(json);
		openBracket = isArray ? '[' : '{';
		closeBracket = isArray ? ']' : '}';
		root = _level === 1;
		testId = root ? 'json' : undefined;
	});

	let title: string | undefined = $derived(
		valueType === 'hash' ? (json as number[]).join() : undefined
	);

	let collapsed = $state(true);
	run(() => {
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		collapsed = _collapsed === undefined ? defaultExpandedLevel < _level : _collapsed;
	});

	const toggle = () => (collapsed = !collapsed);
</script>

{#if isExpandable && hasChildren}
	{#if collapsed}
		<span
			data-tid={testId}
			class="key"
			class:expanded={!collapsed}
			class:collapsed
			class:root
			class:arrow={isExpandable && hasChildren}
			role="button"
			aria-label={$i18n.core.toggle}
			tabindex="0"
			onkeypress={($event) => handleKeyPress({ $event, callback: toggle })}
			onclick={stopPropagation(toggle)}
			>{keyLabel}
			<span class="bracket">{openBracket} ... {closeBracket}</span>
		</span>
	{:else}
		<!-- key -->
		<span
			data-tid={testId}
			class="key"
			class:expanded={!collapsed}
			class:collapsed
			class:root
			class:arrow={isExpandable && hasChildren}
			role="button"
			aria-label={$i18n.core.toggle}
			tabindex="0"
			onkeypress={($event) => handleKeyPress({ $event, callback: toggle })}
			onclick={stopPropagation(toggle)}
			>{keyLabel}<span class="bracket open">{openBracket}</span></span
		>
		<!-- children -->
		<ul>
			{#each children as [key, value], index (index)}
				<li>
					<Json json={value} _key={key} {defaultExpandedLevel} _level={_level + 1} />
				</li>
			{/each}
		</ul>
		<span class="bracket close">{closeBracket}</span>
	{/if}
{:else if isExpandable}
	<!-- no childre -->
	<span data-tid={testId} class="key" class:root
		>{keyLabel}<span class="bracket">{openBracket} {closeBracket}</span></span
	>
{:else}
	<!-- key:value -->
	<span data-tid={testId} class="key-value">
		<span class="key" class:root>{keyLabel}</span><span class="value {valueType}" {title}
			>{value}</span
		></span
	>
{/if}

<style lang="scss">
	@use '../../styles/mixins/interaction';

	.root,
	.root ~ ul,
	.root ~ span {
		// first arrow extra space
		margin-left: var(--padding);
	}

	ul {
		// reset
		margin: 0;
		padding: 0 0 0 var(--padding-2x);
		list-style: none;

		display: flex;
		flex-direction: column;
		gap: var(--padding-0_5x);
	}
	.key {
		display: inline-block;
		position: relative;

		color: var(--label-color);

		margin-right: var(--padding-0_5x);
	}
	.value {
		// Values can be strings of JSON and long. We want to break the value, so that the keys stay on the same line.
		word-break: break-all;
	}
	.arrow {
		@include interaction.tappable;
		// increase click area
		padding: 0 var(--padding-0_5x);
		// compensate click area
		transform: translateX(calc(-1 * var(--padding-0_5x)));
		min-width: var(--padding);

		display: inline-block;
		position: relative;
		border-radius: var(--padding-0_5x);

		&:hover {
			color: var(--primary-contrast);
			background: var(--primary);
			&::before {
				color: var(--primary);
			}
			.bracket {
				color: var(--primary-contrast);
			}
		}

		&::before {
			display: inline-block;
			position: absolute;
			left: 0;
			top: 0;
			// Move left to compensate for the padding of the ul
			// Move down to compensate for the gap between li
			transform: translate(calc(-1 * var(--padding-1_5x)), calc(0.8 * var(--padding)));
			font-size: var(--padding);
		}
		&.expanded::before {
			content: '▼';
		}
		&.collapsed::before {
			content: '▶';
		}
	}

	// value types
	.bracket {
		color: var(--json-bracket-color);
	}
	.value {
		color: var(--json-value-color);
	}
	.value.string {
		color: var(--json-string-color);
	}
	.value.number {
		color: var(--json-number-color);
	}
	.value.null {
		color: var(--json-null-color);
	}
	.value.principal {
		color: var(--json-principal-color);
	}
	.value.hash {
		color: var(--json-hash-color);
	}
	.value.bigint {
		color: var(--json-bigint-color);
	}
	.value.boolean {
		color: var(--json-boolean-color);
	}
</style>
