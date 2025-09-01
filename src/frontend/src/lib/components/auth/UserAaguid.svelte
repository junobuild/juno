<script lang="ts">
    import type { User } from '$lib/types/user';
    import aaguids from '$lib/env/aaguids.json';
    import type {Option} from "$lib/types/utils";
    import {PasskeyAaguidsSchema} from "$lib/schemas/passkey-aaguids";

    interface Props {
        user: User;
    }

    let {user}: Props = $props();

    const mapAaguid = (user: User): Option<User> => {
        if (user.data.provider !== "webauthn") {
            return null;
        }

        const passkeys = PasskeyAaguidsSchema.safeParse(aaguids);

        if (!passkeys.success) {
            return undefined;
        }

        const {data} = passkeys;

    }

    const loadAaguid = async () => {

    }

    let aaguid = $derived(mapAaguid(user));
</script>

