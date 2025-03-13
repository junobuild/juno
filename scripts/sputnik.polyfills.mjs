#!/usr/bin/env node

import { downloadFromURL } from '@junobuild/cli-tools';
import { writeFile } from 'fs/promises';
import { join } from 'node:path';

const resources = [
	{
		src: '/bytecodealliance/javy/refs/heads/main/crates/javy/src/apis/text_encoding/text-encoding.js',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/text_encoding/javy/text-encoding.js')
	},
	{
		src: '/bytecodealliance/javy/refs/heads/main/crates/javy/src/apis/text_encoding/mod.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/text_encoding/javy/polyfill.rs')
	}
];

const downloadTextEncodingPolyfills = async () => {
	const download = async ({ src, ...rest }) => {
		const polyfill = await downloadFromURL({
			hostname: 'raw.githubusercontent.com',
			path: src,
			headers: {
				'Accept-Encoding': 'identity'
			}
		});

		return {
			...rest,
			src,
			content: polyfill.toString('utf-8')
		};
	};

	return await Promise.all(resources.map(download));
};

const saveJS = async ({ dest, content }) => {
	const noCheckContent = `//@ts-nocheck\n\n${content}`;

	await writeFile(dest, noCheckContent, 'utf-8');
};

const savePolyfill = async ({ dest, content }) => {
	const startIndex = content.indexOf('/// Register `TextDecoder` and `TextEncoder` classes.');

	if (startIndex === -1) {
		throw new Error(
			'Cannot save polyfill. Comment above function `register` not found in polyfill source file.'
		);
	}

	const withoutUseContent = content.slice(startIndex);

	const startTest = withoutUseContent.indexOf('#[cfg(test)]');

	const filteredContent =
		startTest > -1 ? withoutUseContent.slice(0, startTest) : withoutUseContent;

	const customUseContent = `use std::str;

use crate::js::apis::node::text_encoding::javy::impls::Args;
use crate::js::apis::node::text_encoding::javy::utils::{to_js_error, to_string_lossy};
use crate::{hold, hold_and_release};
use anyhow::{anyhow, bail, Error, Result};
use rquickjs::{
    context::EvalOptions, Ctx, Exception, Function, String as JSString, TypedArray, Value,
};

${filteredContent.trim()}
`;

	await writeFile(dest, customUseContent, 'utf-8');
};

const [js, polyfill] = await downloadTextEncodingPolyfills();

await saveJS(js);

await savePolyfill(polyfill);
