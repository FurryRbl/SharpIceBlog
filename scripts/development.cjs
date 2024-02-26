"use strict";

var hexo = hexo || {};
const fs = require("fs");
const prettier = require("prettier");

// 处理 prettier 配置文件
const prettierConfig = JSON.parse(fs.readFileSync(".prettierrc.json", "utf-8"));
prettierConfig.parser = "html";
delete prettierConfig.overrides;
prettierConfig.printWidth = 240;

if (hexo.env.cmd === "server") {
	hexo.extend.filter.register(
		"after_render:html",
		function (htmlContent, data) {
			// 格式化 HTML
			const formatHtmlContent = prettier.format(
				htmlContent,
				prettierConfig
			);
			return formatHtmlContent;
		}
	);
}
