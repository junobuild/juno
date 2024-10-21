export type QrCreatorConfig = NonNullable<unknown>;
export interface QrCreateClass {
	render: (config: QrCreatorConfig, $element: HTMLElement) => void;
}
