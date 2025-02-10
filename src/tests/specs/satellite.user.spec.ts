import {beforeAll, describe, inject} from "vitest";
import {type Actor, PocketIc} from "@hadronous/pic";
import type {_SERVICE as SatelliteActor} from "$declarations/satellite/satellite.did";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {idlFactory as idlFactorSatellite} from "$declarations/satellite/satellite.factory.did";
import {controllersInitArgs, SATELLITE_WASM_PATH} from "./utils/setup-tests.utils";


describe('Satellite User', () => {
    let pic: PocketIc;
    let actor: Actor<SatelliteActor>;

    const controller = Ed25519KeyIdentity.generate();

    beforeAll(async () => {
        pic = await PocketIc.create(inject('PIC_URL'));

        const { actor: c } = await pic.setupCanister<SatelliteActor>({
            idlFactory: idlFactorSatellite,
            wasm: SATELLITE_WASM_PATH,
            arg: controllersInitArgs(controller),
            sender: controller.getPrincipal()
        });

        actor = c;

        actor.setIdentity(controller);
    });

    afterAll(async () => {
        await pic?.tearDown();
    });
});