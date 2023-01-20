export const idlFactory = ({ IDL }) => {
	return IDL.Service({ greet: IDL.Func([IDL.Text], [IDL.Text], ['query']) });
};
export const init = ({ IDL }) => {
	return [];
};
