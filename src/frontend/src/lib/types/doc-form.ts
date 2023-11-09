export enum DocFieldTypeEnum {
	BOOLEAN = 'boolean',
	STRING = 'string',
	NUMBER = 'number'
}

export interface DocField {
	name: string;
	fieldType: DocFieldTypeEnum;
	value: string | boolean | number;
}
