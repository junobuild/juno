import {tick} from "./pic-tests.utils";
import type {PocketIc} from "@hadronous/pic";

export const waitServerlessFunction = async (pic: PocketIc) => {
// Wait for the serverless function to being fired
    await tick(pic);
};