const INTERSECTION_THRESHOLD = 0.8;
const INTERSECTION_ROOT_MARGIN = '-100px 0px';

export interface IntersectingDetail {
	intersecting: boolean;
}

const dispatchIntersecting = ({
	element,
	intersecting
}: {
	element: HTMLElement;
	intersecting: boolean;
}) => {
	const $event = new CustomEvent<IntersectingDetail>('junoIntersecting', {
		detail: { intersecting },
		bubbles: false
	});
	element.dispatchEvent($event);
};

export const onIntersection = (element: HTMLElement) => {
	const options: IntersectionObserverInit = {
		threshold: INTERSECTION_THRESHOLD,
		rootMargin: INTERSECTION_ROOT_MARGIN
	};

	const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
		const intersecting: boolean =
			entries.find(({ isIntersecting }: IntersectionObserverEntry) => isIntersecting) !== undefined;

		dispatchIntersecting({ element, intersecting });
	};

	const observer: IntersectionObserver = new IntersectionObserver(intersectionCallback, options);

	observer.observe(element);

	return {
		destroy() {
			observer.disconnect();
		}
	};
};
