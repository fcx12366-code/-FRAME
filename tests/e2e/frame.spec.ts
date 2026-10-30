import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const cards = '.film-grid .film-card';
const storageKey = 'frame-cinema:v1';

test('real search matches Chinese, English, director and actor', async ({ page }) => {
  await page.goto('/search');
  const input = page.getByRole('searchbox');
  for (const [query, title] of [
    ['钢铁之泪', '钢铁之泪'],
    ['Sintel', '辛特尔'],
    ['Ian Hubert', '钢铁之泪'],
    ['Derek de Lint', '钢铁之泪'],
    ['张鲁一', '三体'],
  ]) {
    await input.fill(query);
    await expect(page.locator(cards).getByRole('link', { name: title, exact: true })).toBeVisible();
    await expect(page.getByRole('status')).toContainText('1');
  }
  await input.fill('不存在的影片 827364');
  await expect(page.getByRole('heading', { name: '还没有找到这束光' })).toBeVisible();
  await page.getByRole('button', { name: '清除筛选', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(page.locator(cards)).toHaveCount(15);
});

test('combined filters, shareable URL, history back and empty state', async ({ page }) => {
  await page.goto('/browse/movie');
  await page.getByRole('combobox', { name: '类型', exact: true }).selectOption('动画');
  await page.getByRole('combobox', { name: '地区', exact: true }).selectOption('荷兰');
  await page.getByRole('combobox', { name: '年份', exact: true }).selectOption('2010');
  await page.getByRole('checkbox', { name: '有免费入口' }).check();
  await expect(page.locator(cards)).toHaveCount(1);
  await expect(
    page.locator(cards).getByRole('link', { name: '辛特尔', exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/availability=free/);
  await page.reload();
  await expect(page.getByRole('combobox', { name: '年份', exact: true })).toHaveValue('2010');
  await expect(page.locator(cards)).toHaveCount(1);
  await page.getByRole('combobox', { name: '年份', exact: true }).selectOption('2012');
  await expect(page.getByRole('heading', { name: '还没有找到这束光' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('combobox', { name: '年份', exact: true })).toHaveValue('2010');
  await expect(page.locator(cards)).toHaveCount(1);
  await page.getByRole('button', { name: '重置全部' }).click();
  await expect(page).toHaveURL('/browse/movie');
  await expect(page.locator(cards)).toHaveCount(9);
});

test('detail route is independently addressable and favorite survives refresh', async ({
  page,
}) => {
  await page.goto('/film/sintel');
  await expect(page.getByRole('heading', { level: 1, name: '辛特尔' })).toBeVisible();
  await expect(page.getByRole('link', { name: '免费开始观看' })).toHaveAttribute(
    'href',
    '/watch/sintel',
  );
  await page.getByRole('button', { name: '收藏《辛特尔》', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '取消收藏《辛特尔》', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(
    page.getByRole('button', { name: '取消收藏《辛特尔》', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/library');
  await expect(page.locator(cards)).toHaveCount(1);
  await expect(
    page.locator(cards).getByRole('link', { name: '辛特尔', exact: true }),
  ).toBeVisible();
});

test('DOM-simulated progress persists and clear history preserves favorites', async ({ page }) => {
  await page.goto('/watch/sintel');
  // This deliberately tests application persistence, not streaming or full-film playback.
  await page.locator('video').evaluate((node) => {
    const video = node as HTMLVideoElement;
    Object.defineProperty(video, 'duration', { configurable: true, value: 900 });
    Object.defineProperty(video, 'currentTime', { configurable: true, value: 123 });
    video.dispatchEvent(new Event('timeupdate', { bubbles: true }));
  });
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key) || '{}').history?.sintel?.time,
        storageKey,
      ),
    )
    .toBe(123);
  await page.getByRole('button', { name: '收藏《辛特尔》', exact: true }).click();
  await page.goto('/library');
  await page.getByRole('button', { name: /^观看记录/ }).click();
  await expect(page.getByRole('progressbar', { name: '辛特尔观看进度' })).toHaveAttribute(
    'value',
    '123',
  );
  await page.reload();
  await expect(page).toHaveURL(/tab=history/);
  await expect(page.getByRole('button', { name: /^观看记录/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('progressbar', { name: '辛特尔观看进度' })).toHaveAttribute(
    'value',
    '123',
  );
  await page.getByRole('button', { name: '清空观看记录', exact: true }).click();
  await page.getByRole('button', { name: '保留记录', exact: true }).click();
  await expect(page.getByRole('progressbar')).toBeVisible();
  await page.getByRole('button', { name: '清空观看记录', exact: true }).click();
  await page.getByRole('button', { name: '确认清空', exact: true }).click();
  await expect(page.getByRole('heading', { name: '还没有开始一场放映。' })).toBeVisible();
  await page.getByRole('button', { name: /我的收藏/ }).click();
  await expect(page.locator(cards)).toHaveCount(1);
});

test('unknown routes and corrupt localStorage recover visibly', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '{broken-json'), storageKey);
  await page.goto('/library');
  await expect(page.getByRole('heading', { name: '你的私人片单，等第一部电影。' })).toBeVisible();
  for (const route of ['/missing-page', '/film/missing-film', '/collections/missing-collection']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: '这一页暂时不在画面里' })).toBeVisible();
    await expect(page.getByRole('link', { name: '浏览电影', exact: true })).toHaveAttribute(
      'href',
      '/browse/movie',
    );
  }
});

test('mobile navigation closes with Escape and reduced-motion is respected', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const open = page.getByRole('button', { name: '打开导航菜单' });
  await open.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: '关闭导航菜单' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(
    page
      .getByRole('navigation', { name: '主导航' })
      .getByRole('link', { name: '纪录片', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(open).toHaveAttribute('aria-expanded', 'false');
  await expect(open).toBeFocused();
  const motion = await page
    .getByRole('link', { name: '免费开始观看', exact: true })
    .evaluate((node) => ({
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
      transition: getComputedStyle(node).transitionDuration,
      animation: getComputedStyle(node).animationName,
      scroll: getComputedStyle(document.documentElement).scrollBehavior,
    }));
  expect(motion).toEqual({ reduced: true, transition: '0s', animation: 'none', scroll: 'auto' });
});

test('seven widths across seven routes have no horizontal overflow', async ({ page }) => {
  test.setTimeout(240000);
  await fs.mkdir('work/qa/screenshots', { recursive: true });
  const widths = [1920, 1440, 1024, 768, 430, 393, 375];
  const routes = [
    ['home', '/'],
    ['browse', '/browse/movie'],
    ['detail', '/film/tears-of-steel'],
    ['search', '/search?q=Sintel'],
    ['library', '/library'],
    ['collections', '/collections'],
    ['documentary', '/browse/documentary'],
  ];
  const results: unknown[] = [];
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of widths) {
    await page.setViewportSize({ width, height: width <= 430 ? 852 : 1000 });
    for (const [name, route] of routes) {
      await page.goto(route, { waitUntil: 'networkidle' });
      await expect(page.locator('h1')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const metrics = await page.evaluate(() => ({
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        overflowing: [...document.querySelectorAll('body *')]
          .filter((element) => {
            const box = element.getBoundingClientRect();
            const css = getComputedStyle(element);
            return (
              css.position !== 'fixed' &&
              css.visibility !== 'hidden' &&
              css.display !== 'none' &&
              box.width > 1 &&
              (box.right > innerWidth + 1 || box.left < -1)
            );
          })
          .slice(0, 10)
          .map((element) => ({
            tag: element.tagName,
            class: element.className,
            right: element.getBoundingClientRect().right,
          })),
      }));
      results.push({ width, route, ...metrics });
      await page.screenshot({ path: `work/qa/screenshots/${width}-${name}.png`, fullPage: true });
      await fs.writeFile(
        'work/qa/responsive-results.json',
        JSON.stringify({ results, errors }, null, 2),
      );
      expect
        .soft(metrics.document, `${width}px ${route}: horizontal document overflow`)
        .toBeLessThanOrEqual(width);
      expect
        .soft(metrics.body, `${width}px ${route}: horizontal body overflow`)
        .toBeLessThanOrEqual(width);
    }
  }
  expect(errors).toEqual([]);
});

test('idle player stays ready for a user gesture without a timeout error', async ({ page }) => {
  await page.goto('/watch/sintel');
  await expect(page.locator('video')).toBeVisible();
  await page.waitForTimeout(21500);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('video')).toHaveJSProperty('paused', true);
  await expect(page.getByRole('button', { name: '开始放映' })).toBeVisible();
});

test('deliberately blocked media shows an actionable error and retry returns to idle', async ({
  page,
}) => {
  // Failure injection tests error UI only, and is not real playback evidence.
  await page.route('https://video.blender.org/object-storage/**', (route) => route.abort('failed'));
  await page.goto('/watch/sintel');
  await page.getByRole('button', { name: '开始放映' }).click();
  await expect(page.getByRole('alert')).toContainText('暂时无法连接视频源');
  await expect(page.getByRole('link', { name: '前往官方页面' })).toHaveAttribute(
    'href',
    /^https:\/\/video\.blender\.org\/(videos\/watch|w)\//,
  );
  await page.getByRole('button', { name: '重新加载', exact: true }).click();
  await expect(page.getByRole('button', { name: '开始放映' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('three official video streams: genuine click and playback diagnostics', async ({ page }) => {
  test.setTimeout(100000);
  await fs.mkdir('work/qa', { recursive: true });
  const results: unknown[] = [];
  for (const id of ['tears-of-steel', 'sintel', 'big-buck-bunny']) {
    const networkErrors: string[] = [];
    const onRequestFailed = (request: import('@playwright/test').Request) => {
      if (/blender|xiph/.test(request.url()))
        networkErrors.push(`${request.url()}: ${request.failure()?.errorText}`);
    };
    page.on('requestfailed', onRequestFailed);
    await page.goto(`/watch/${id}`, { waitUntil: 'domcontentloaded' });
    const video = page.locator('video');
    await expect(video).toBeVisible();
    await page.getByRole('button', { name: '开始放映' }).click();
    const startedAt = Date.now();
    let progressed = false;
    while (Date.now() - startedAt < 22000) {
      const state = await video.evaluate((node) => ({
        time: (node as HTMLVideoElement).currentTime,
        error: (node as HTMLVideoElement).error?.code,
      }));
      if (state.time >= 1) {
        progressed = true;
        break;
      }
      if (state.error) break;
      await page.waitForTimeout(500);
    }
    const diagnostics = await video.evaluate((node) => {
      const v = node as HTMLVideoElement;
      return {
        src: v.currentSrc || v.src,
        currentTime: v.currentTime,
        duration: Number.isFinite(v.duration) ? v.duration : null,
        readyState: v.readyState,
        networkState: v.networkState,
        paused: v.paused,
        textTracks: Array.from(v.textTracks).map((track) => ({
          language: track.language,
          label: track.label,
          kind: track.kind,
        })),
        error: v.error ? { code: v.error.code, message: v.error.message } : null,
      };
    });
    results.push({
      id,
      progressed,
      elapsedMs: Date.now() - startedAt,
      diagnostics,
      networkErrors,
      applicationErrorVisible: await page
        .getByRole('alert')
        .isVisible()
        .catch(() => false),
    });
    await page.screenshot({ path: `work/qa/video-${id}.png`, fullPage: true });
    page.off('requestfailed', onRequestFailed);
    await fs.writeFile(
      'work/qa/video-results.json',
      JSON.stringify(
        {
          methodology:
            'Real installed Chrome, no request interception; clicked the product-visible 开始放映 button; observed up to 22 seconds, success means currentTime >= 1 second. This is not full-film playback verification.',
          results,
        },
        null,
        2,
      ),
    );
  }
  // Network failures are recorded as evidence rather than fabricated test successes.
  expect(results).toHaveLength(3);
});
