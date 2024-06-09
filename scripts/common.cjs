'use strict';

var hexo = hexo || {};

const terser = require('terser');
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
	100,
);

// 处理 JavaScript
hexo.extend.filter.register(
	'after_render:js',
	async function (source, data) {
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
	101,
);
