"use strict";

var hexo = hexo || {};

hexo.extend.filter.register("post_permalink", (data) => {
	if (data.startsWith("post/")) {
		const parts = data.split("/").filter(Boolean);

		if (parts.length > 1) {
			parts[parts.length - 2] = parts[parts.length - 2].replace(
				/^\d+\./,
				""
			);
			parts.pop();
			return `${parts.join("/")}/`;
		} else {
			return "/";
		}
	} else {
		return data;
	}
});
