<script lang="ts">
    import {onMount} from "svelte";
    import {authenticate} from "$lib/services/auth/auth.openid.services";

    const signIn = async () => {
        const result = await authenticate();
        console.log(result);
    }

    onMount(signIn)
</script>

Wait for it...