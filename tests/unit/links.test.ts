import { describe, expect, it } from 'vitest';
import { safeOfficialUrl, safeVideoUrl } from '../../src/utils/links';

describe('official link boundary', () => {
  it.each([
    'javascript:alert(1)',
    'data:text/html,hello',
    'http://studio.blender.org/films/',
    'https://studio.blender.org.evil.example/films/',
    'https://evil-studio.blender.org/films/',
    'https://user:password@studio.blender.org/films/',
    'https://studio.blender.org:8443/films/',
    'https://studio.blender.org/redirect?url=https://evil.example',
    'https://studio.blender.org/films/?next=https://evil.example',
    'https://studio.blender.org\\@evil.example',
    ' https://studio.blender.org/films/',
  ])('rejects unsafe destination %s', (url) => {
    expect(safeOfficialUrl(url)).toBeNull();
  });
  it('accepts exact trusted official hosts', () => {
    expect(safeOfficialUrl('https://studio.blender.org/films/sintel/')).toBe(
      'https://studio.blender.org/films/sintel/',
    );
    expect(safeOfficialUrl('https://tv.cctv.com/2026/01/01/VIDE123.shtml')).toBeTruthy();
  });
  it('restricts video streams to the verified Blender sources and file types', () => {
    expect(
      safeVideoUrl(
        'https://download.blender.org/demo/movies/BBB/bbb_sunflower_1080p_30fps_normal.mp4',
      ),
    ).toBeTruthy();
    expect(
      safeVideoUrl('https://video.blender.org/object-storage/web_videos/test.mp4'),
    ).toBeTruthy();
    expect(safeVideoUrl('https://media.xiph.org/mango/tears_of_steel_1080p.webm')).toBeTruthy();
    expect(safeVideoUrl('https://media.xiph.org/unverified.mp4')).toBeNull();
    expect(safeVideoUrl('https://video.blender.org/unknown/test.mp4')).toBeNull();
    expect(safeVideoUrl('https://archive.org/unverified.mp4')).toBeNull();
    expect(safeVideoUrl('https://download.blender.org/demo/movies/film.html')).toBeNull();
  });
});
