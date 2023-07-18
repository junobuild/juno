import type QrCreator from 'qr-creator';

export type QrCreatorConfig = QrCreator.Config;
export type QrCreateClass = {
	render: (config: QrCreatorConfig, $element: HTMLElement) => void;
};
