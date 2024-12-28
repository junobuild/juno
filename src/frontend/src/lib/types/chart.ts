export interface ChartsData {
	x: string;
	y: number;
}

export type TimeOfDayDate = string; // 2018-07-28

export type TimeOfDaySeconds = number;

export interface TimeOfDayChartData {
	x: TimeOfDaySeconds;
	y: TimeOfDayDate;
}