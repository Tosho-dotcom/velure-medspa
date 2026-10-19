/**
 * Full page load to another route. Used between the home page and the legal
 * pages on purpose: the home page builds GSAP pins, scroll-scrubbed sections
 * and Lenis state on load, and they must start fresh rather than survive a
 * client-side transition.
 */
export function hardNavigate(path: string) {
  window.location.assign(path);
}
