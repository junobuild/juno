<script lang="ts">
	export let name: string;
	export let inputType: 'icp' | 'number' | 'text' = 'number';
	export let required = true;
	export let spellcheck: boolean | undefined = undefined;
	export let step: number | 'any' | undefined = undefined;
	export let disabled = false;
	export let minlength: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let value: string | number | undefined = undefined;
	export let placeholder: string;
	export let testId: string | undefined = undefined;

	// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
	export let autocomplete: 'off' | 'on' | undefined = undefined;

	let inputElement: HTMLInputElement | undefined;

	$: step = inputType === 'number' ? step ?? 'any' : undefined;
	$: autocomplete = inputType !== 'number' ? autocomplete ?? 'off' : undefined;

	let selectionStart: number | null = 0;
	let selectionEnd: number | null = 0;

	// To show undefined as "" (because of the type="text")
	const fixUndefinedValue = (value: string | number | undefined): string =>
		value === undefined ? '' : `${value}`;

	let icpValue: string = fixUndefinedValue(value);
	let lastValidICPValue: string | number | undefined = value;
	let internalValueChange = true;

	$: value,
		(() => {
			if (!internalValueChange && inputType === 'icp') {
				icpValue = fixUndefinedValue(value);
				lastValidICPValue = icpValue;
			}

			internalValueChange = false;
		})();

	const restoreFromValidValue = (noValue = false) => {
		if (inputElement === undefined || inputType !== 'icp') {
			return;
		}

		if (noValue) {
			lastValidICPValue = undefined;
		}

		internalValueChange = true;
		value =
			lastValidICPValue === undefined
				? undefined
				: typeof lastValidICPValue === 'number'
					? lastValidICPValue.toFixed(8)
					: +lastValidICPValue;
		icpValue = fixUndefinedValue(lastValidICPValue);

		// force dom update (because no active triggers)
		inputElement.value = icpValue;

		// restore cursor position
		inputElement.setSelectionRange(selectionStart, selectionEnd);
	};

	// The type declaration of the input event is neither defined in node types nor in svelte.
	// This extends the event with the currentTarget that is provided by the browser and that can be used to retrieve the input value.
	type InputEventHandler = Event & {
		currentTarget: EventTarget & HTMLInputElement;
	};

	const isValidICPFormat = (text: string): boolean => /^[\d]*(\.[\d]{0,8})?$/.test(text);

	const handleInput = ({ currentTarget }: InputEventHandler) => {
		if (inputType === 'icp') {
			const currentValue = currentTarget.value;

			// handle invalid input
			if (isValidICPFormat(currentValue) === false) {
				// restore value (e.g. to fix invalid paste)
				restoreFromValidValue();
				return;
			}

			// reset to undefined ("" => undefined)
			if (currentValue.length === 0) {
				restoreFromValidValue(true);
				return;
			}

			lastValidICPValue = currentValue;
			icpValue = fixUndefinedValue(currentValue);

			internalValueChange = true;
			// for inputType="icp" value is a number
			// TODO: do we need to fix lost precision for too big for number inputs?
			value = +currentValue;
			return;
		}

		internalValueChange = true;
		value = inputType === 'number' ? +currentTarget.value : currentTarget.value;
	};

	const handleKeyDown = () => {
		if (inputElement === undefined) {
			return;
		}

		// preserve selection
		({ selectionStart, selectionEnd } = inputElement);
	};

	$: step = inputType === 'number' ? step ?? 'any' : undefined;
	$: autocomplete =
		inputType !== 'number' && inputType !== 'icp' ? autocomplete ?? 'off' : undefined;
</script>

<input
	bind:this={inputElement}
	data-tid={testId}
	type={inputType === 'icp' ? 'text' : inputType}
	{required}
	{spellcheck}
	{name}
	id={name}
	{step}
	{disabled}
	value={inputType === 'icp' ? icpValue : value}
	{minlength}
	{placeholder}
	{max}
	{autocomplete}
	on:blur
	on:focus
	on:input={handleInput}
	on:keydown={handleKeyDown}
/>
