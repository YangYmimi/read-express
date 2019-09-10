#### 关于 express.js

> API : https://expressjs.com/zh-cn/4x/api.html#express

1. 第三方中间件 :

```
var bodyParser = require('body-parser');
var EventEmitter = require('events').EventEmitter;
var mixin = require('merge-descriptors');
```

* [`body-parser`](https://github.com/expressjs/body-parser) : 对请求体进行解析
* [`events.EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter) : 事件触发与事件监听
* [`merge-descriptors`](https://github.com/component/merge-descriptors) : 对象合并

2. 自定义模块 :

```
var proto = require('./application');
var Route = require('./router/route');
var Router = require('./router');
var req = require('./request');
var res = require('./response');
```

* `proto` : `appliction` 服务器应用的初始化

* `req` : 自定义的 `request` 对象, `express` 文档中关于 `request` 对象具有如下 [属性 和 API](https://expressjs.com/zh-cn/4x/api.html#req)。

* `res` : 自定义的 `response` 对象, `express` 文档中关于 `response` 对象具有如下 [属性 和 API](https://expressjs.com/zh-cn/4x/api.html#re)。

3. 中间件系统的更改

> `express.js` 中定义了部分核心中间件已不在 `express` 中存在，需要单独安装使用

https://expressjs.com/zh-cn/guide/migrating-4.html#changes 列出了已经发生变化的中间件。