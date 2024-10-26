<script lang="ts">
	import { IcpWallet } from '@dfinity/oisy-wallet-signer/icp-wallet';
	import { DEV } from '$lib/constants/constants';
	import type { IcrcAccount } from '@dfinity/oisy-wallet-signer';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18n } from '$lib/stores/i18n.store';

	let steps: 'init' = $state('init');
	let account: IcrcAccount | undefined;

	const WALLET_URL = DEV ? 'http://localhost:5174/sign' : 'https://oisy.com/sign';

	let wallet: IcpWallet | undefined;

	const init = async () => {
		let wallet: IcpWallet | undefined;

		try {
			wallet = await IcpWallet.connect({
				url: WALLET_URL
			});

			const { allPermissionsGranted } = await wallet.requestPermissionsNotGranted();

			if (!allPermissionsGranted) {
				return;
			}

			const accounts = await wallet.accounts();

			account = accounts?.[0];
		} catch (err: unknown) {
			console.log(err);
			toasts.error({
				text: $i18n.errors.wallet_signer_no_account
			});

			return;
		} finally {
			await wallet?.disconnect();
		}
	};

	$effect(() => {
		init();
	});
</script>

<div class="container"></div>

<style lang="scss">
	.container {
		min-height: 100px;
	}
</style>
