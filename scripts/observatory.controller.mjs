#!/usr/bin/env node

import pkgPrincipal from '@dfinity/principal';
import { observatoryActorIC } from './actor.mjs';

const { Principal } = pkgPrincipal;

const principal = Principal.fromText(
	'ozbq5-kobnz-6zez3-ok5uu-pz6js-kitcd-he6z2-yz7v6-ozpnq-pk3ha-dae'
);

const setCronController = async () => {
	const actor = await observatoryActorIC();

	const controller = {
		metadata: [],
		expires_at: []
	};

	const controllers = [principal];

	await actor.set_cron_controllers({
		controller,
		controllers
	});

	console.log('Cron controller set.');
};

await setCronController();
