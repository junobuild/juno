export const segmentType = (type) => {
	switch (type) {
		case 'satellite':
			return { Satellite: null };
		case 'orbiter':
			return { Orbiter: null };
		default:
			return { MissionControl: null };
	}
};
