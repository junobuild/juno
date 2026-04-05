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

const transformFilterTest = (content) => {
	const startTest = content.indexOf('#[cfg(test)]');
	return startTest > -1 ? content.slice(0, startTest) : content;
};

const transformTextEncodingPolyfill = (content) => {
	const startIndex = content.indexOf('/// Register `TextDecoder` and `TextEncoder` classes.');

	if (startIndex === -1) {
		throw new Error(
			'Cannot save polyfill. Comment above function `register` not found in polyfill source file.'
		);
	}

	const withoutUseContent = content.slice(startIndex);

	const filteredContent = transformFilterTest(withoutUseContent);

	return `use std::str;

use crate::js::apis::node::javy::text_encoding::impls::Args;
use crate::js::apis::node::javy::text_encoding::utils::{to_js_error, to_string_lossy};
use crate::{hold, hold_and_release};
use anyhow::{anyhow, bail, Error, Result};
use rquickjs::{
    context::EvalOptions, Ctx, Exception, Function, String as JSString, TypedArray, Value,
};

${filteredContent.trim()}
`;
};

const transformLlrtUtilsPath = (content) =>
	content.replace(/^use llrt_utils::\s*\n?/m, 'use crate::js::apis::node::llrt::llrt_utils::');

const transformLlrtUtils = (content) => {
	const parsedContent = content.replace(/^use crate::\s*\n?/m, 'use super::');
	return `#![allow(dead_code)]\n\n${parsedContent}`;
};

const transformLlrtUrl = (content) => {
	return `#![allow(clippy::inherent_to_string)]\n\n${content}`;
};

const transformLlrtUrlClass = (content) => {
	const filteredContent = content.replace(
		'pub fn url_to_http_options',
		'#[allow(dead_code)]\npub fn url_to_http_options'
	);
	return transformLlrtUrl(transformLlrtUtilsPath(filteredContent));
};

const transformLlrtUrlSearchParams = (content) => {
	const filteredContent = transformFilterTest(content);
	return transformLlrtUrl(transformLlrtUtilsPath(filteredContent));
};

const savePolyfill = async ({ dest, content, transform }) => {
	const customUseContent = nonNullish(transform) ? transform(content) : content;

	await writeFile(dest, customUseContent, 'utf-8');
};

const resources = [
	{
		src: '/bytecodealliance/javy/refs/heads/main/crates/javy/src/apis/text_encoding/text-encoding.js',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/javy/text_encoding/text-encoding.js')
	},
	{
		src: '/bytecodealliance/javy/refs/heads/main/crates/javy/src/apis/text_encoding/mod.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/javy/text_encoding/polyfill.rs'),
		transform: transformTextEncodingPolyfill
	},
	{
		src: '/awslabs/llrt/refs/heads/main/modules/llrt_buffer/src/blob.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/llrt/llrt_buffer/blob.rs'),
		transform: transformLlrtUtilsPath
	},
	{
		src: '/awslabs/llrt/refs/heads/main/modules/llrt_buffer/src/file.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/llrt/llrt_buffer/file.rs'),
		transform: transformLlrtUtilsPath
	},
	{
		src: '/awslabs/llrt/refs/heads/main/libs/llrt_utils/src/time.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/llrt/llrt_utils/time.rs'),
		transform: transformLlrtUtils
	},
	{
		src: '/awslabs/llrt/refs/heads/main/libs/llrt_utils/src/result.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/llrt/llrt_utils/result.rs'),
		transform: transformLlrtUtils
	},
	{
		src: '/awslabs/llrt/refs/heads/main/libs/llrt_utils/src/primordials.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/llrt/llrt_utils/primordials.rs'),
		transform: transformLlrtUtils
	},
	{
		src: '/awslabs/llrt/refs/heads/main/libs/llrt_utils/src/class.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/llrt/llrt_utils/class.rs'),
		transform: transformLlrtUtils
	},
	{
		src: '/awslabs/llrt/refs/heads/main/libs/llrt_utils/src/object.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/llrt/llrt_utils/object.rs'),
		transform: transformLlrtUtils
	},
	{
		src: '/awslabs/llrt/refs/heads/main/libs/llrt_utils/src/error_messages.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/llrt/llrt_utils/error_messages.rs'),
		transform: transformLlrtUtils
	},
	{
		src: '/awslabs/llrt/refs/heads/main/libs/llrt_utils/src/bytes.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/llrt/llrt_utils/bytes.rs'),
		transform: transformLlrtUtils
	},
	{
		src: '/awslabs/llrt/refs/heads/main/modules/llrt_url/src/url_class.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/llrt/llrt_url/url_class.rs'),
		transform: transformLlrtUrlClass
	},
	{
		src: '/awslabs/llrt/refs/heads/main/modules/llrt_url/src/url_search_params.rs',
		dest: join(process.cwd(), 'src/sputnik/src/js/apis/node/llrt/llrt_url/url_search_params.rs'),
		transform: transformLlrtUrlSearchParams
	}
];

const [textEncodingJS, textEncodingRS, ...llrt] = await downloadTextEncodingPolyfills();

// text_encoding
await saveJS(textEncodingJS);
await savePolyfill(textEncodingRS);

// blob
for (const file of llrt) {
	await savePolyfill(file);
}
