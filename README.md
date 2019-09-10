# Read Express

Node Express Practise

## 中间件

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
  - 调用 `next()` 跳过路由中间件剩余的中间件函数。该方式仅在使用 `app.METHOD()` 或 `router.METHOD()` 函数装入的中间件函数中有效

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

打算按照目录结构对 `express` 的内部源码进行阅读，对 `express` 代码添加对应注解，目录见 `express@4.17.1`

#### 关于 express.js

[express.md](readme/express.md)

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

`route.js`

```
function Route(path) {
  this.path = path;

  // 存放 layer 的组件
  this.stack = [];

  debug('new %o', path)

  // route handlers for various http methods
  // 存放 HTTP 方法的对象
  this.methods = {};
}

Route.prototype.all = function all() {
  // 获取所有的回调函数
  var handles = flatten(slice.call(arguments));

  for (var i = 0; i < handles.length; i++) {
    var handle = handles[i];

    if (typeof handle !== 'function') {
      var type = toString.call(handle);
      var msg = 'Route.all() requires a callback function but got a ' + type
      throw new TypeError(msg);
    }

    var layer = Layer('/', {}, handle);
    layer.method = undefined;

    this.methods._all = true;
    this.stack.push(layer);
  }

  // 始终返回 this，就可以使用链式调用了
  return this;
};

// 遍历 methods 将其依次定义在 Route 对象中
methods.forEach(function(method){
  Route.prototype[method] = function(){
    var handles = flatten(slice.call(arguments));
    // 依次调用对应的 layer 方法
    for (var i = 0; i < handles.length; i++) {
      var handle = handles[i];

      if (typeof handle !== 'function') {
        var type = toString.call(handle);
        var msg = 'Route.' + method + '() requires a callback function but got a ' + type
        throw new Error(msg);
      }

      debug('%s %o', method, this.path)

      var layer = Layer('/', {}, handle);
      layer.method = method;

      this.methods[method] = true;
      this.stack.push(layer);
    }

    return this;
  };
});
```

```
router.get('/path', fn1, fn2, fn3);
router.get('/path', [fn1, [fn2, [fn3]]]);
router.get('/path', fn1).get('/path', fn2).get('/path', fn3);
```

#### 其他

其他阅读主要是在阅读源码过程中联想到的其他知识点，以 `issue` 的方式加到 `repo` 中

* [merge-descriptors](https://github.com/YangYmimi/read-express/issues/1)

* [setprototypeof](https://github.com/YangYmimi/read-express/issues/2)

* [express 中的中间件](https://github.com/YangYmimi/read-express/issues/3)