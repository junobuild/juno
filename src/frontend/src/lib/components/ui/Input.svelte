<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { isNullish, nonNullish } from '@dfinity/utils';

	export let name: string;
	export let inputType: 'icp' | 'number' | 'text' | 'currency' = 'number';
	export let required = true;
	export let spellcheck: boolean | undefined = undefined;
	export let step: number | 'any' | undefined = undefined;
	export let disabled = false;
	export let minLength: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let value: string | number | undefined = undefined;
	export let placeholder: string;
	export let testId: string | undefined = undefined;
	export let decimals = 8;
	export let ignore1Password = true;

	const dispatch = createEventDispatcher();

	// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
	export let autocomplete: 'off' | 'on' | undefined = undefined;

	let inputElement: HTMLInputElement | undefined;

	$: step = inputType === 'number' ? step ?? 'any' : undefined;
	$: autocomplete = inputType !== 'number' ? autocomplete ?? 'off' : undefined;

	// This component was developed for ICP and 8 decimals in mind. The "currency" input type was added afterwards therefore, for backwards compatibility reason, if the input type is set to icp, the number of decimals remains 8.
	let wrapDecimals = 8;
	$: wrapDecimals = inputType === 'icp' ? 8 : decimals;

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

	let currencyValue: string = exponentToPlainNumberString(fixUndefinedValue(value));
	let lastValidCurrencyValue: string | number | undefined = value;
	let internalValueChange = true;

	let currency = false;
	$: currency = ['icp', 'currency'].includes(inputType);

	$: value,
		(() => {
			if (!internalValueChange && currency) {
				if (typeof value === 'number') {
					currencyValue = exponentToPlainNumberString(`${value}`);
				} else {
					currencyValue = fixUndefinedValue(value);
				}

				lastValidCurrencyValue = currencyValue;
			}

			internalValueChange = false;
		})();

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

		dispatch('nnsInput');
	};

	const handleKeyDown = () => {
		if (isNullish(inputElement)) {
			return;
		}

		// preserve selection
		({ selectionStart, selectionEnd } = inputElement);
	};

	$: step = inputType === 'number' ? step ?? 'any' : undefined;
	$: autocomplete = inputType !== 'number' && !currency ? autocomplete ?? 'off' : undefined;
</script>

<input
	bind:this={inputElement}
	data-tid={testId}
	type={currency ? 'text' : inputType}
	{required}
	{spellcheck}
	{name}
	id={name}
	{step}
	{disabled}
	value={currency ? currencyValue : value}
	minlength={minLength}
	{placeholder}
	{max}
	{autocomplete}
	on:blur
	on:focus
	on:input={handleInput}
	on:keydown={handleKeyDown}
	data-1p-ignore={ignore1Password}
/>
