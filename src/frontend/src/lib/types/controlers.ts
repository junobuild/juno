export type SetControllerParams = {
	controllerId: string;
	profile: string | null | undefined;
	scope: 'write' | 'admin';
};
