export const assertHeaders = ({ headers }: { headers: [string, string][] }) => {
	const rest = headers.filter(([header, _]) => header !== 'IC-Certificate');

	const sortHeaders = (headers: [string, string][]): [string, string][] =>
		headers.sort((a, b) => a[0].localeCompare(b[0]));

	const expectedHeaders: [string, string][] = [
		['accept-ranges', 'bytes'],
		['etag', '"03ee66f1452916b4f91a504c1e9babfa201b6d64c26a82b2cf03c3ed49d91585"'],
		['x-content-type-options', 'nosniff'],
		['strict-transport-security', 'max-age=31536000 ; includeSubDomains'],
		['referrer-policy', 'same-origin'],
		['x-frame-options', 'DENY'],
		['cache-control', 'no-cache'],
		[
			'IC-CertificateExpression',
			'default_certification(ValidationArgs{certification:Certification{no_request_certification:Empty{},response_certification:ResponseCertification{certified_response_headers:ResponseHeaderList{headers:["accept-ranges","cache-control","etag","referrer-policy","strict-transport-security","x-content-type-options","x-frame-options"]}}}})'
		]
	];

	expect(sortHeaders(rest)).toEqual(sortHeaders(expectedHeaders));
};
