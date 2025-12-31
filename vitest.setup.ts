import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/svelte';
import 'fake-indexeddb/auto';

vi.stubGlobal('VITE_APP_VERSION', 'app-version');

configure({
	testIdAttribute: 'data-tid'
});
