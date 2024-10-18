<script lang="ts">
    import { IcpWallet } from '@dfinity/oisy-wallet-signer/icp-wallet';
    import {onMount} from "svelte";

    export let wallet: "OISY";

    let wallet: IcpWallet

    const connect = async () => {
        wallet = await IcpWallet.connect({
            url: WALLET_URL
        });

        const permissions = await wallet.permissions();

        const requestPermissionsIfNeeded = async (): Promise<{ allScopesGranted: boolean }> => {
            const findNotGranted = (permissions: IcrcScopesArray): IcrcScopeMethod[] =>
                permissions.filter(({ state }) => state !== 'granted').map(({ scope }) => scope);

            const notGrantedScopes = findNotGranted(permissions);

            if (notGrantedScopes.length === 0) {
                return { allScopesGranted: true };
            }

            const result = await wallet?.requestPermissions({
                params: {
                    scopes: notGrantedScopes
                }
            });

            const remainingNotGrantedScopes = findNotGranted(result ?? []);

            if (remainingNotGrantedScopes.length === 0) {
                return { allScopesGranted: true };
            }

            alertStore.set({
                type: 'error',
                message: 'The wallet requires all permissions to be approved.'
            });

            return { allScopesGranted: false };
        };

        const { allScopesGranted } = await requestPermissionsIfNeeded();

        if (!allScopesGranted) {
            return;
        }

        const accounts = await wallet.accounts();

        account = accounts?.[0];
    }

    onMount()

</script>