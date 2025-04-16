#!/usr/bin/env node

import { nonNullish } from '@dfinity/utils';
import { downloadFromURL } from '@junobuild/cli-tools';
import { writeFile } from 'fs/promises';
import { join } from 'node:path';

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

const transformTextEncodingPolyfill = (content) => {
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

	return `use std::str;

use crate::js::apis::node::text_encoding::javy::impls::Args;
use crate::js::apis::node::text_encoding::javy::utils::{to_js_error, to_string_lossy};
use crate::{hold, hold_and_release};
use anyhow::{anyhow, bail, Error, Result};
use rquickjs::{
    context::EvalOptions, Ctx, Exception, Function, String as JSString, TypedArray, Value,
};

${filteredContent.trim()}
`;
};

const transformBlobPolyfill = (content) => {
	const contentNoFileImport = content.replace(/^use super::file::File;\s*\n?/m, '');
	return contentNoFileImport.replace(/\s*\|\|\s*obj\.instance_of::<File>\(\)\s*/g, '');
};

const savePolyfill = async ({ dest, content, transform }) => {
	const customUseContent = nonNullish(transform) ? transform(content) : content;

	await writeFile(dest, customUseContent, 'utf-8');
};

const resources = [
	{
		src: '/bytecodealliance/javy/refs/heads/main/crates/javy/src/apis/text_encoding/text-encoding.js',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/text_encoding/javy/text-encoding.js')
	},
	{
		src: '/bytecodealliance/javy/refs/heads/main/crates/javy/src/apis/text_encoding/mod.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/text_encoding/javy/polyfill.rs'),
		transform: transformTextEncodingPolyfill
	},
	{
		src: '/awslabs/llrt/refs/heads/main/modules/llrt_http/src/blob.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/blob/llrt/polyfill.rs'),
		transform: transformBlobPolyfill
	}
];

const [textEncodingJS, textEncodingRS, blobRS] = await downloadTextEncodingPolyfills();

// text_encoding
await saveJS(textEncodingJS);
await savePolyfill(textEncodingRS);

// blob
await savePolyfill(blobRS);
