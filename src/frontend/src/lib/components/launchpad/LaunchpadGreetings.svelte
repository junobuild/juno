<script lang="ts">
	import { getHours } from 'date-fns';
	import { i18n } from '$lib/stores/app/i18n.store';

	const timedGreeting = (): string => {
		const hour = getHours(new Date());

		return hour >= 5 && hour < 12
			? $i18n.launchpad.morning
			: hour >= 12 && hour < 18
				? $i18n.launchpad.afternoon
				: $i18n.launchpad.good_evening;
	};

	const genericGreetings = [$i18n.launchpad.welcome_back, $i18n.launchpad.greetings];

	let greetings = $derived([...genericGreetings, timedGreeting()]);

	const titles = [$i18n.launchpad.commander, $i18n.launchpad.spacebuilder, $i18n.launchpad.captain];

	let greeting = $derived(greetings[Math.floor(Math.random() * greetings.length)]);
	let title = $derived(titles[Math.floor(Math.random() * titles.length)]);
</script>

<p>🖖 {greeting} {title}</p>

<style lang="scss">
	h1 {
		margin-top: var(--padding-4x);
	}
</style>
