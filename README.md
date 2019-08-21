# Read Express

Node Express Practise

## middlewares

#### Can do

* 执行任何代码。
* 对请求和响应对象进行更改。
* 结束请求/响应循环。
* 调用堆栈中的下一个中间件函数。

#### Different middlewares

* [应用层中间件](https://expressjs.com/zh-cn/guide/using-middleware.html#middleware.application)

  - 绑定到 `app.Router()` 的实例
  - app.use()
  - app.METHOD()

* [路由器层中间件](https://expressjs.com/zh-cn/guide/using-middleware.html#middleware.router)

  - 绑定到 `express.Router()` 的实例
  - router.use()
  - router.METHOD()
  - 调用 `next('route')` 跳过路由中间件剩余的中间件函数。该方式仅在使用 `app.METHOD()` 或 `router.METHOD()` 函数装入的中间件函数中有效

* [错误处理中间件](https://expressjs.com/zh-cn/guide/using-middleware.html#middleware.error-handling)

  - 始终采用四个自变量 (err, req, res, next)
  - 请在其他 `app.use()` 和路由调用之后，最后定义错误处理中间件
  - 如果将任何项传递到 `next()` 函数（除了字符串 'route'），那么 Express 会将当前请求视为处于错误状态，并跳过所有剩余的非错误处理路由和中间件函数

* [内置中间件](https://expressjs.com/zh-cn/guide/using-middleware.html#middleware.built-in)

  - https://github.com/senchalabs/connect#middleware

* [第三方中间件](https://expressjs.com/zh-cn/guide/using-middleware.html#middleware.third-party)

  - https://expressjs.com/zh-cn/resources/middleware.html

## Code Analysis

#### Basic Structure

> Based express@4.17.1

```
├── lib
│   ├── middleware
│   │   ├── init.js
│   │   └── query.js
│   ├── router
│   │   ├── index.js
│   │   ├── layer.js
│   │   └── route.js
│   ├── application.js
│   ├── express.js
│   ├── request.js
│   ├── response.js
│   ├── utils.js
│   └── view.js
├── History.md
├── index.js 入口文件
├── LICENSE
├── package.json
└── Readme.md
```

#### express.js

`express.js` 由入口文件 `index.js` 加载

引入第三方中间件 :

* [`body-parser`](https://github.com/expressjs/body-parser) : 对请求体进行解析
* [`events.EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter) : 事件触发与事件监听
* [`merge-descriptors`](https://github.com/component/merge-descriptors) : 对象合并

```
var removedMiddlewares = [
  'bodyParser',
  'compress',
  'cookieSession',
  'session',
  'logger',
  'cookieParser',
  'favicon',
  'responseTime',
  'errorHandler',
  'timeout',
  'methodOverride',
  'vhost',
  'csrf',
  'directory',
  'limit',
  'multipart',
  'staticCache'
]
```

`express.js` 中明确的定义了上述中间件已不在 `express` 中存在，需要单独安装使用

引入自定义模块 :

* `req` : 自定义的 `request` 对象, `express` 文档中所有关于 `request` 对象的 `属性` 和 `API` 如下 https://expressjs.com/zh-cn/4x/api.html#req。该模块使用 [`http.IncomingMessage`](https://nodejs.org/api/http.html#http_class_http_incomingmessage) 原型创建的对象, 继承所有 `http.IncomingMessage` 的原型方法

  - `http` : `node` 的 `http` 模块
  - [`Object.create()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create)

* `res` : 自定义的 `response` 对象, `express` 文档中所有关于 `response` 对象的 `属性` 和 `API` 如下 https://expressjs.com/zh-cn/4x/api.html#re。

提供的 `API` 有

https://expressjs.com/zh-cn/4x/api.html#express

在 `express.js` 文件中发现都通过 `module.exports` 导出

#### merge-descriptors

* [Object.prototype.hasOwnProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty)
* [Object.getOwnPropertyNames](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames)
* [Object.getOwnPropertyDescriptor](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor)
* [Object.defineProperty()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

```
'use strict'

module.exports = merge

// 自身属性, 忽略原型链上继承的属性
var hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * Merge the property descriptors of `src` into `dest`
 *
 * @param {object} dest Object to add descriptors to
 * @param {object} src Object to clone descriptors from
 * @param {boolean} [redefine=true] Redefine `dest` properties with `src` properties
 * @returns {object} Reference to dest
 * @public
 */

function merge(dest, src, redefine) {
  if (!dest) {
    throw new TypeError('argument dest is required')
  }

  if (!src) {
    throw new TypeError('argument src is required')
  }

  if (redefine === undefined) {
    // Default to true
    // 默认使用 `dest` 中的属性替换 `src` 的属性
    redefine = true
  }

  // 返回一个由指定对象的所有自身属性的属性名（包括不可枚举属性但不包括Symbol值作为名称的属性）组成的数组
  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames#Description
  Object.getOwnPropertyNames(src).forEach(function forEachOwnPropertyName(name) {
    if (!redefine && hasOwnProperty.call(dest, name)) {
      // Skip desriptor
      // 如果不覆盖，则自动跳过已存在于 `dest` 中的属性
      return
    }

    // Copy descriptor
    // 返回属性描述符对象
    var descriptor = Object.getOwnPropertyDescriptor(src, name)
    Object.defineProperty(dest, name, descriptor)
  })

  return dest
}
```

#### router 文件夹

* layer.js : 定义中间件基本数据结构
* route.js : 定义 `express` 路由中间件 `Route`
* index.js : 定义 `Router` 对象即中间件容器，用来存放路由中间件(Route)以及其他功能中间件

`Router` 是中间件容器，存放了 `Route` 路由中间件和其他中间件，`Route` 作为路由中间件封装了路由信息

`layer.js`

  - handle_error : 定义了 `express` 错误处理部分

```
app.use(function (err, req, res, next) {})
```

  - handle_request

```
app.get(function (req, res, next) {})
```

  - match

使用 path-to-regexp 进行路由验证，参数匹配等

```
/user/:id => req.params.id
```