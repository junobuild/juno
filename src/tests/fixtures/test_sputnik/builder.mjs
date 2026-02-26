const mod = await import('././custom-functions.mjs');

for (const [name, value] of Object.entries(mod)) {
	console.log(name + ': ' + value);
}