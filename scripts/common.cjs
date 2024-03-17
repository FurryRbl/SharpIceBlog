"use strict";

var hexo = hexo || {};

const terser = require("terser");
const postcss = require("postcss");
const cssnano = require("cssnano");
const postcssPresetEnv = require("postcss-preset-env");

// 处理 CSS
hexo.extend.filter.register("after_render:css", function (source, data) {
	postcss([
		postcssPresetEnv({
			stage: 0,
		}),
		cssnano({
			preset: "advanced",
		}),
	])
		.process(source, {
			from: data.path,
			map: false,
		})
		.then((result) => {
			return result.css;
		})
		.catch((error) => {
			console.error(error);
			return source;
		});
});

// 处理 JavaScript
hexo.extend.filter.register("after_render:js", async function (source, data) {
	try {
		const minifiedCode = await terser.minify(source, {
			sourceMap: false,
		});

		return minifiedCode.code;
	} catch (error) {
		console.error(error);
		return source;
	}
});
