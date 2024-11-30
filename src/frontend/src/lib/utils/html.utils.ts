import DOMPurify from 'dompurify';

/**
 * A workaround to preserve target="_blank" attribute from sanitizer.
 * Utilizes data-target flag (set by flagTargetAttributeHook).
 *
 * Inspired by https://github.com/cure53/DOMPurify/issues/317#issuecomment-912474068
 */
const restoreTargetAttributeHook = (node: Element) => {
	if (node.getAttribute('data-target') === 'blank') {
		// Use provided "rel" value if it contains "noopener" or "noreferrer" (https://web.dev/external-anchors-use-rel-noopener/)
		// otherwise add "noopener".
		// split() to avoid invalid values (e.g. "noopenernoreferrer")
		const originRel = node.getAttribute('rel') ?? '';
		const parts = originRel.split(/\s+/);
		const rel = parts.includes('noopener') || parts.includes('noreferrer') ? originRel : 'noopener';

		node.setAttribute('target', '_blank');
		node.setAttribute('rel', rel);

		// remove the flag
		node.removeAttribute('data-target');
	}
};

/**
 * Add the data attribute because "target" will be removed by sanitizer
 */
const flagTargetAttributeHook = (node: Element) => {
	if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
		node.setAttribute('data-target', 'blank');
	}

	return node;
};

/**
 * Sanitize a text with DOMPurify.
 */
export const sanitize = (text: string): string => {
	try {
		return DOMPurify.sanitize(text) ?? '';
	} catch (err) {
		console.error(err);
	}

	console.error('no DOMPurify support');

	return '';
};

DOMPurify.addHook('beforeSanitizeAttributes', flagTargetAttributeHook);
DOMPurify.addHook('afterSanitizeAttributes', restoreTargetAttributeHook);