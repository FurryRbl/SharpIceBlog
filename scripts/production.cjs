'use strict';

var hexo = hexo || {};
const minifyHTML = require('html-minifier-terser').minify;

/** @type {import('html-minifier-terser').Options} */
const htmlMinifyConfig = {
	removeAttributeQuotes: false, // class="foo-bar" to class=foo-bar
	removeComments: true,
	collapseWhitespace: true,
	removeEmptyAttributes: true,
	minifyCSS: true,
	minifyJS: true,
};

if (hexo.env.cmd === 'generate' || hexo.env.cmd === 'g') {
	// 压缩 HTML
	hexo.extend.filter.register(
		'after_render:html',
		async function (htmlContent) {
			const HTML = await minifyHTML(htmlContent, htmlMinifyConfig);
			return HTML;
		},
		1000,
	);
}
