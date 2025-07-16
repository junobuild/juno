import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.stubGlobal('VITE_APP_VERSION', 'app-version');
