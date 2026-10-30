// Exact host matching is intentional: suffix matching accepts attacker-owned domains.
const officialHosts = new Set([
  'studio.blender.org',
  'www.blender.org',
  'blender.org',
  'download.blender.org',
  'media.blender.org',
  'peach.blender.org',
  'durian.blender.org',
  'mango.blender.org',
  'orange.blender.org',
  'gooseberry.blender.org',
  'video.blender.org',
  'media.xiph.org',
  'sintel.org',
  'www.sintel.org',
  'tearsofsteel.org',
  'www.tearsofsteel.org',
  'bigbuckbunny.org',
  'www.bigbuckbunny.org',
  'tv.cctv.com',
  'www.1905.com',
  'wetv.vip',
  'archive.org',
  'www.archive.org',
  'commons.wikimedia.org',
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'www.vimeo.com',
  'www.arte.tv',
  'arte.tv',
  'www.nfb.ca',
  'nfb.ca',
  'www.bfi.org.uk',
  'bfi.org.uk',
  'www.criterionchannel.com',
  'criterionchannel.com',
  'www.netflix.com',
  'netflix.com',
  'www.disneyplus.com',
  'disneyplus.com',
  'www.primevideo.com',
  'primevideo.com',
  'www.pbs.org',
  'pbs.org',
  'www.pbsamerica.co.uk',
  'www.tubitv.com',
  'tubitv.com',
  'www.kanopy.com',
  'kanopy.com',
  'www.pexels.com',
  'creativecommons.org',
]);
const videoHosts = new Set([
  'download.blender.org',
  'media.blender.org',
  'video.blender.org',
  'media.xiph.org',
]);
const redirectParameters =
  /^(url|uri|redirect|redirect_uri|redirect_url|return|return_to|returnurl|next|continue|target|dest|destination|u)$/i;

function parseSafeUrl(value: unknown, hosts: Set<string>): URL | null {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    Array.from(value).some(
      (character) =>
        character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127 || character === '\\',
    )
  )
    return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port ||
      !hosts.has(url.hostname)
    )
      return null;
    if (/\/(redirect|out|away|url)(\/|$)/i.test(url.pathname)) return null;
    for (const key of url.searchParams.keys()) if (redirectParameters.test(key)) return null;
    return url;
  } catch {
    return null;
  }
}

export function safeOfficialUrl(value: unknown): string | null {
  return parseSafeUrl(value, officialHosts)?.href ?? null;
}

/** This only checks the destination. The film must also carry a verified license. */
export function safeVideoUrl(value: unknown): string | null {
  const url = parseSafeUrl(value, videoHosts);
  if (!url || !/\.(mp4|webm|ogv)$/i.test(url.pathname)) return null;
  if (
    url.hostname === 'video.blender.org' &&
    !url.pathname.startsWith('/object-storage/web_videos/')
  )
    return null;
  if (url.hostname === 'media.xiph.org' && url.pathname !== '/mango/tears_of_steel_1080p.webm')
    return null;
  return url.href;
}
