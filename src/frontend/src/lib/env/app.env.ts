export const isSkylab = (): boolean => import.meta.env.MODE === 'skylab';
export const isNotSkylab = (): boolean => !isSkylab();

export const isDev = (): boolean => import.meta.env.DEV || isSkylab();

export const isProd = (): boolean => import.meta.env.PROD;
