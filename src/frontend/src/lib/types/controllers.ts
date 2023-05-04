export type SetControllerParams = {
	controllerId: string;
	profile: string | null | undefined;
	scope: SetControllerScope;
};

export type SetControllerScope = 'write' | 'admin';