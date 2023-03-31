export const idlFactory = ({ IDL }) => {
	const ObservatoryAddMissionControlArgs = IDL.Record({
		mission_control_id: IDL.Principal,
		owner: IDL.Principal
	});
	return IDL.Service({
		add_mission_control: IDL.Func([ObservatoryAddMissionControlArgs], [], []),
		version: IDL.Func([], [IDL.Text], ['query'])
	});
};
export const init = ({ IDL }) => {
	return [];
};
