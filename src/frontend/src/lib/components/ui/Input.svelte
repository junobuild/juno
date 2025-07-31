<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { onMount, type Snippet, untrack } from 'svelte';

	interface Props {
		name: string;
		inputType?: 'icp' | 'number' | 'text' | 'currency';
		required?: boolean;
		spellcheck?: boolean | undefined;
		step?: number | 'any' | undefined;
		disabled?: boolean;
		minLength?: number | undefined;
		max?: number | undefined;
		value?: string | number | undefined;
		placeholder: string;
		testId?: string | undefined;
		decimals?: number;
		ignore1Password?: boolean;
		autofocus?: boolean;
		// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
		autocomplete?: 'off' | 'on' | undefined;
		oninput?: () => void;
		onblur?: () => void;
		onfocus?: () => void;
		end?: Snippet;
		footer?: Snippet;
	}

	let {
		name,
		inputType = 'number',
		required = true,
		spellcheck = undefined,
		step = $bindable(undefined),
		disabled = false,
		minLength = undefined,
		max = undefined,
		value = $bindable(undefined),
		placeholder,
		testId = undefined,
		decimals = 8,
		ignore1Password = true,
		autofocus = false,
		autocomplete = $bindable('off'),
		oninput,
		onblur,
		onfocus,
		end,
		footer
	}: Props = $props();

	let inputElement: HTMLInputElement | undefined = $state();

	// This component was developed for ICP and 8 decimals in mind. The "currency" input type was added afterwards therefore, for backwards compatibility reason, if the input type is set to icp, the number of decimals remains 8.
	let wrapDecimals = $derived(inputType === 'icp' ? 8 : decimals);

	let selectionStart: number | null = 0;
	let selectionEnd: number | null = 0;

	const toStringWrapDecimals = (value: string): string =>
		Number(value).toLocaleString('en', {
			useGrouping: false,
			maximumFractionDigits: wrapDecimals
		});

	// replace exponent format (1e-4) w/ plain (0.0001)
	const exponentToPlainNumberString = (value: string): string =>
		// number to toLocaleString doesn't support decimals for values >= ~1e16
		value.includes('e') ? toStringWrapDecimals(value) : value;
	// To show undefined as "" (because of the type="text")
	const fixUndefinedValue = (value: string | number | undefined): string =>
		isNullish(value) ? '' : `${value}`;

	let currencyValue: string = $state(exponentToPlainNumberString(fixUndefinedValue(value)));
	let lastValidCurrencyValue: string | number | undefined = $state(value);
	let internalValueChange = $state(true);

	let currency = $derived(['icp', 'currency'].includes(inputType));

	$effect(() => {
		// Subscribe to value changes only
		value;

		untrack(() => {
			if (!internalValueChange && currency) {
				if (typeof value === 'number') {
					currencyValue = exponentToPlainNumberString(`${value}`);
				} else {
					currencyValue = fixUndefinedValue(value);
				}

				lastValidCurrencyValue = currencyValue;
			}

			internalValueChange = false;
		});
	});

	const restoreFromValidValue = (noValue = false) => {
		if (isNullish(inputElement) || !currency) {
			return;
		}

		if (noValue) {
			lastValidCurrencyValue = undefined;
		}

		internalValueChange = true;
		value = isNullish(lastValidCurrencyValue)
			? undefined
			: typeof lastValidCurrencyValue === 'number'
				? lastValidCurrencyValue.toFixed(wrapDecimals)
				: inputType === 'icp'
					? +lastValidCurrencyValue
					: lastValidCurrencyValue;
		currencyValue = fixUndefinedValue(lastValidCurrencyValue);

		// force dom update (because no active triggers)
		inputElement.value = currencyValue;

		// restore cursor position
		inputElement.setSelectionRange(selectionStart, selectionEnd);
	};

	// The type declaration of the input event is neither defined in node types nor in svelte.
	// This extends the event with the currentTarget that is provided by the browser and that can be used to retrieve the input value.
	type InputEventHandler = Event & {
		currentTarget: EventTarget & HTMLInputElement;
	};

	const isDecimalsFormat = (text: string): boolean => {
		const regex = new RegExp(`^\\d*(\\.\\d{0,${wrapDecimals}})?$`);
		return regex.test(text);
	};

	const handleInput = ({ currentTarget }: InputEventHandler) => {
		if (currency) {
			const currentValue = exponentToPlainNumberString(currentTarget.value);

			// handle invalid input
			if (isDecimalsFormat(currentValue) === false) {
				// restore value (e.g. to fix invalid paste)
				restoreFromValidValue();
			} else if (currentValue.length === 0) {
				// reset to undefined ("" => undefined)
				restoreFromValidValue(true);
			} else {
				lastValidCurrencyValue = currentValue;
				currencyValue = fixUndefinedValue(currentValue);

				internalValueChange = true;
				// for inputType="icp" value is a number
				value = inputType === 'icp' ? +currentValue : toStringWrapDecimals(currentValue);
			}
		} else {
			internalValueChange = true;
			value = inputType === 'number' ? +currentTarget.value : currentTarget.value;
		}

		oninput?.();
	};

	const handleKeyDown = () => {
		if (isNullish(inputElement)) {
			return;
		}

		// preserve selection
		({ selectionStart, selectionEnd } = inputElement);
	};

	let innerStep = $derived(inputType === 'number' ? (step ?? 'any') : undefined);
	let innerAutocomplete = $derived(inputType !== 'number' ? (autocomplete ?? 'off') : undefined);

	onMount(() => {
		if (!autofocus) {
			return;
		}

		inputElement?.focus();
	});
</script>

<div class="input-field" class:with-footer={nonNullish(footer)}>
	<input
		bind:this={inputElement}
		id={name}
		{name}
		autocomplete={innerAutocomplete}
		data-1p-ignore={ignore1Password}
		data-tid={testId}
		{disabled}
		{max}
		minlength={minLength}
		onblur={() => onblur?.()}
		onfocus={() => onfocus?.()}
		oninput={handleInput}
		onkeydown={handleKeyDown}
		{placeholder}
		{required}
		{spellcheck}
		step={innerStep}
		type={currency ? 'text' : inputType}
		value={currency ? currencyValue : value}
	/>

	{#if nonNullish(end)}
		<div class="inner-end">{@render end()}</div>
	{/if}

	{#if nonNullish(footer)}
		<div class="footer">{@render footer()}</div>
	{/if}
</div>

<style lang="scss">
	.input-field {
		position: relative;
	}

	.inner-end {
		position: absolute;
		top: 50%;
		right: 3px;
		transform: translate(0, calc(-50% - var(--padding-0_5x)));
	}

	.with-footer {
		margin: 0 0 var(--padding-2x);

		input {
			margin: var(--padding) 0 var(--padding-0_25x);
		}

		.inner-end {
			transform: translate(0, calc(-50% - var(--padding-1_5x)));
		}
	}

	.footer {
		padding: 0 var(--padding-2x);
	}
</style>
