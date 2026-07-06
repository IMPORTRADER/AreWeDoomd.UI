import { matchPath } from 'react-router-dom';

// Single-segment paths under the shell that are NOT profiles. Must mirror the
// static routes in AppRouter that sit before the dynamic `/:username` route.
const RESERVED_ROOT_PATHS = new Set(['settings', 'about', 'privacy', 'terms', 'help']);

// Returns the profile username for a path, or null when the path isn't a
// profile route. `matchPath('/:username', …)` matches ANY single segment, so it
// can't tell `/dogaAi` (a profile) from `/settings` (a static page). Without
// this guard the right rail rendered <ProfileRail username="settings" />, which
// fetched a non-existent user and hung on the skeleton — the right column never
// loaded on /settings, /about, /privacy, /terms and /help.
export function getProfileUsername(pathname) {
  const username = matchPath('/:username', pathname)?.params?.username;
  if (!username || RESERVED_ROOT_PATHS.has(username)) return null;
  return username;
}
