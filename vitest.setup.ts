import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

vi.stubGlobal('VITE_APP_VERSION', 'app-version');
