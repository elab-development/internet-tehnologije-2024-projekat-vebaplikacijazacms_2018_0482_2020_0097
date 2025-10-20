import classic from './classic.js';
import magazine from './magazine.js';

export const TEMPLATES = { classic, magazine };

export function getTemplate(name = 'classic') {
  return TEMPLATES[name] || TEMPLATES.classic;
}
