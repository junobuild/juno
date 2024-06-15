#!/usr/bin/env node

import { Ed25519KeyIdentity } from '@dfinity/identity';
import { getIdentity, saveToken } from './console.config.utils.mjs';

const key = Ed25519KeyIdentity.generate();
const principal = key.getPrincipal().toText();
const token = key.toJSON();

await fetch(`http://localhost:5999/console/controller/?id=${principal}`);

saveToken(token);

console.log('Controller generated:', getIdentity().getPrincipal().toText());
