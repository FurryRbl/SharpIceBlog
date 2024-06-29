'use strict';

var hexo = hexo || {};

hexo.extend.filter.register('before_post_render', function (data) {
	data.content = data.content.replace(/\(([^)]*\.md)\)/g, '($1.html)');

	return data;
});
