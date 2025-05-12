import type { OutgoingHttpHeaders } from 'http';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

export const buildServer = (): Server =>
	createServer(async (_request: IncomingMessage, res: ServerResponse) => {
		// https://stackoverflow.com/a/54309023/5404186
		const corsHeaders: OutgoingHttpHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
			'Access-Control-Max-Age': 2592000, // 30 days
			'Access-Control-Allow-Headers': 'content-type'
		};

		const headers: OutgoingHttpHeaders = {
			...corsHeaders,
			'Content-Type': 'application/json'
		};

		res.writeHead(200, headers);
		res.end(JSON.stringify({ ok: true }));
	});
