"use strict";

var hexo = hexo || {};
const { minify } = require("html-minifier-terser");

/** @type {import('html-minifier-terser').Options} */
const minifyConfig = {
	removeAttributeQuotes: false, // class="foo-bar" to class=foo-bar
	removeComments: true,
	collapseWhitespace: true,
	removeEmptyAttributes: true,
	minifyCSS: true,
	minifyJS: true,
};

if (hexo.env.cmd === "generate") {
	hexo.extend.filter.register(
		"after_render:html",
		async function (htmlContent, data) {
			// 压缩 HTML
			const HTML = await minify(htmlContent, minifyConfig);
			return HTML;
		}
	);
}
