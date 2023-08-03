import type {GitHubAsset} from "@junobuild/admin";
import {digestMessage, sha256ToBase64String} from "$lib/utils/crypto.utils";

const downloadFromUrl = async (src: string): Promise<string> => {
    const htmlTemplate: Response = await fetch(src);
    return htmlTemplate.text();
};

export const downloadWasm = async ({ browser_download_url }: GitHubAsset): Promise<{hash: string; wasm: string}> => {
    const content = await downloadFromUrl(browser_download_url);
    const sha256 = sha256ToBase64String(new Uint8Array(await digestMessage(content)));

    console.log(content, sha256);

    return {
        wasm: content,
        hash: sha256
    }
};