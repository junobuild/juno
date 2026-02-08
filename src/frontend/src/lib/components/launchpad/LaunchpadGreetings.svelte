<script lang="ts">
	import { fromNullable, nonNullish } from '@dfinity/utils';
	import { getHours } from 'date-fns';
	import type { ConsoleDid } from '$declarations';
	import IconTerminal from '$lib/components/icons/IconTerminal.svelte';
	import TextAnimated from '$lib/components/ui/TextAnimated.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		provider?: ConsoleDid.Provider;
		withoutReturningLabel?: boolean;
	}

	let { provider, withoutReturningLabel = false }: Props = $props();

	let openId = $derived<ConsoleDid.OpenId | undefined>(
		nonNullish(provider) && 'OpenId' in provider ? provider.OpenId : undefined
	);
	let openIdData = $derived<ConsoleDid.OpenIdData | undefined>(openId?.data);
	let openIdGivenName = $derived<string | undefined>(fromNullable(openIdData?.given_name ?? []));
	let openIdPreferredUsername = $derived<string | undefined>(
		fromNullable(openIdData?.preferred_username ?? [])
	);
	let displayName = $derived(openIdPreferredUsername ?? openIdGivenName);

	const timedGreeting = (): string => {
		const hour = getHours(new Date());

		return hour >= 5 && hour < 12
			? $i18n.launchpad.morning
			: hour >= 12 && hour < 18
				? $i18n.launchpad.afternoon
				: $i18n.launchpad.good_evening;
	};

	let genericGreetings = $derived([
		...(withoutReturningLabel ? [] : [$i18n.launchpad.welcome_back]),
		$i18n.launchpad.greetings
	]);

	let greetings = $derived([...genericGreetings, timedGreeting()]);

	const titles = [$i18n.launchpad.commander, $i18n.launchpad.spacebuilder, $i18n.launchpad.captain];

	let greeting = $derived(greetings[Math.floor(Math.random() * greetings.length)]);
	let title = $derived(titles[Math.floor(Math.random() * titles.length)]);

	let text = $derived(`${greeting} ${displayName ?? title}`);
</script>

<p><IconTerminal /> <TextAnimated {text} /></p>

<style lang="scss">
	p {
		margin: 0 0 var(--padding-6x);
		width: fit-content;
	}
</style>
