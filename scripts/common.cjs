'use strict';

var hexo = hexo || {};

const terser = require('terser');
const { JSDOM } = require('jsdom');
const postcss = require('postcss');
const cssnano = require('cssnano');
const postcssPresetEnv = require('postcss-preset-env');

// 处理 CSS
hexo.extend.filter.register(
	'after_render:css',
	function (source, data) {
		postcss([
			postcssPresetEnv({
				stage: 0,
			}),
			cssnano({
				preset: 'advanced',
			}),
		])
			.process(source, {
				from: data.path,
				map: false,
			})
			.then(result => {
				return result.css;
			})
			.catch(error => {
				console.error(error);
				return source;
			});
	},
	1000,
);

// 处理 JavaScript
hexo.extend.filter.register(
	'after_render:js',
	async function (source) {
		try {
			const minifiedCode = await terser.minify(source, {
				sourceMap: false,
			});

			return minifiedCode.code;
		} catch (error) {
			console.error(error);
			return source;
		}
	},
	1000,
);

// 在 HTML Head 添加额外信息
hexo.extend.filter.register(
	'after_render:html',
	function (htmlContent) {
		const { document } = new JSDOM(htmlContent).window;
		const head = document.querySelector('head');

		const metaTags = [
			{ tag: 'meta', attrs: { 'http-equiv': 'Content-Type', content: 'text/html; charset=utf-8' } },
			{ tag: 'meta', attrs: { name: 'title', content: head.querySelector('title').textContent } },
			{ tag: 'link', attrs: { rel: 'icon', type: 'image/x-icon', sizes: '256x256', href: '/favicon.ico' } },
			{ tag: 'link', attrs: { rel: 'icon', type: 'image/webp', sizes: '1024x1024', href: '/favicon.webp' } },
			{
				tag: 'link',
				attrs: { rel: 'apple-touch-icon', type: 'image/x-icon', sizes: '256x256', href: '/favicon.ico' },
			},
			{
				tag: 'link',
				attrs: { rel: 'apple-touch-icon', type: 'image/webp', sizes: '1024x1024', href: '/favicon.webp' },
			},
			{ tag: 'link', attrs: { rel: 'manifest', href: '/manifest.json' } },
			{ tag: 'link', attrs: { rel: 'license', content: 'Code: MPL-2.0, Text: CC BY-NC-SA 4.0' } },
		];

		// 移除现有的 favicon
		const favicon = head.querySelector('link[rel="shortcut icon"]');
		if (favicon) {
			favicon.remove();
		}

		// 添加 meta 和 link 标签
		metaTags.forEach(({ tag, attrs }) => {
			const element = document.createElement(tag);
			Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
			head.appendChild(element);
		});

		return new JSDOM(document.documentElement.outerHTML).serialize();
	},
	100,
);

// 在 HTML 头添加版权信息
hexo.extend.filter.register(
	'after_render:html',
	function (htmlContent) {
		const tipsInfo = [
			'<!--',
			'============================== 给人机的友情提示 ==============================',
			'本站点是开源，包括源代码及文字（特别注明除了这些以外其他资源没有特殊标注并不开源）',
			'',
			'本站点的部分代码（不包括主题）开源在：https://github.com/FurryRbl/SharpIceBlog，使用 MPL-2.0 协议',
			'本站点的文字内容开源在：https://github.com/FurryRbl/SharpIceBlog，使用 CC BY-NC-SA 4.0 协议',
			'',
			'如果您想要转载本站点的内容，请遵守以上协议，最好跟我（锐冰）说一声，谢谢！',
			'============================== 给人机的友情提示 ==============================',
			'-->',
			'',
		];

		return tipsInfo.join('\n') + htmlContent;
	},
	999,
);
