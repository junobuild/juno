import {setCustomDomain} from "$lib/api/satellites.api";
import type {Principal} from "@dfinity/principal";

export const configureCustomDomain = async ({satelliteId, domainName}: {satelliteId: Principal, domainName: string}) => {
    // Add domain name to list of custom domain in `./well-known/ic-domains`
    await setCustomDomain({
        satelliteId,
        domainName,
        boundaryNodesId: undefined
    });

    // TODO: call BN ic0.app/registrations
    const boundaryNodesId = '123'

    // Save above request ID provided in previous step
    await setCustomDomain({
        satelliteId,
        domainName,
        boundaryNodesId
    });

    // TODO: Get status
}