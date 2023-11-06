export enum DocFieldTypeEnum {
	boolean = 'boolean',
	string = 'string',
	number = 'number'
}

export interface DocField {
	name: string;
	fieldType: DocFieldTypeEnum;
	value: string | boolean | number;
}
