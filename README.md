# Kvasir Query Proxy

这是一个小小的请求代理

这个代理的功能有

- 代理使用阿里云提供的 API 服务，根据 ISBN 查询书籍
- 代理使用腾讯云提供的 API 服务，进行图片的文字识别

## 书籍查询代理

- 可以根据 `IBookProxiable` 协议再创建一个代理
- 同时会将书籍的被查询的次数（包括调用了 API 查询与查询缓存的次数），调用 API 查询的次数记录到 Redis 中

相关接口

```
GET {{uri}}/books/query?isbn=<isbn>
```

## 文字识别的代理

- 客户端直接将需要识别的图片传输到服务，服务会将按照 API 的要求将图片转换为 Base64 编码的字符串
- 这个代理集成了腾讯云提供的 SDK, 调用接口需要的验证信息封装工作，都在服务端完成
- 只接受 `.jpg`, `.jpeg`, `png` 格式的图片
- 传输的图片，经过 Base64 编码后，大小最大为 3MB, 因此图片大小最大大约是 2.25MB

    ```
    base64String.length = (4/3)•image.size
    ```
    
- 图片数据以 form-data 的形式传输到服务端，存放字段为 `image`

相关接口

```
POST {{uri}}/ocr

form-data: {image: <image data>}
```

### 后续

由于腾讯云提供的 Node 版本 SDK 并没有实现 TC3-HMAC-SHA256 签名方法，因此使用此 SDK 时，只能使用 GET 方法，同时图片的大小也有了较大限制，且并没有达到 3MB 的上限。

同时又由于并不知道用户上传的图片大小，一劳永逸的方法是自己实现 TC3-HMAC-SHA256 签名。因此代理中关于腾讯云的接口服务都是使用了 TC3-HMAC-SHA256 签名，并使用 POST 方法。而数据的大小就只由各个接口服务自身限制。

> 用户端调用接口的方式不需要改变

## 接口调用注意

接口被过多调用是不怕的，怕的是恶意的调用每次都触发了云平台的收费。为了避免这种情况，每个关键接口（上面列出的接口），在调用是都需要在请求头部添加相关的头部信息，否则返回 403

相关的头部

```
authorization: <(queryString-timestamp-appSecret).md5.digest('base64')>
timestamp: <date string in ISO format>
```

appSecret 需要在服务端自行设置，这个 appSecrect 与第三方的服务无关，纯粹是自己服务定义的

> 若使用 Postman 进行调试，可以查看 [Dynamic set authorization to header in Postman](https://gist.github.com/Monsoir/d6d6eb324b2ca9ac1f46a5e760e4d03d) 这个代码片段，设置 Postman 每次发起请求时自动计算并设置头部信息

## 服务启动

开发 👇

```
npm run start:dev
```

调试 👇

```
npm run start:debug
```

生产 👇

```
npm run start:prod
```

## 技术栈

- nest(Node.js)
- MongoDB
- Redis
- pm2





