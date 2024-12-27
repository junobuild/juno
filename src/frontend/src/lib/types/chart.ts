export interface ChartsData {
	x: string;
	y: number;
}

export type TimeOfDayDate = string; // 2018-07-28

export type TimeOfDayMilliseconds = number;

export interface TimeOfDayData {
	x: TimeOfDayMilliseconds;
	y: TimeOfDayDate;
}