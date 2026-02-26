const defineQuery = (definition) => ({ ...definition, type: 'query' });

export const hello = defineQuery({
	input: 'text',
	output: 'text',
	handler: (input) => input
});

export const world = defineQuery({
	input: "principal",
	handler: (input) => {
		console.log('world', input.toText());
	}
});