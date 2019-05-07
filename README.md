# Kvasir book query proxy

这是一个小小的代理

这个代理使用阿里云提供的 API 服务，根据 ISBN 查询书籍

> 若有便宜一点（甚至免费）的 API 服务，可以根据 `IBookProxiable` 协议再创建一个代理

为什么要特意拿一个代理来查询？

- 这是出于省钱的原因，1 块钱才给查 30 条😭
- 已查询过的书籍，其数据会保存起来，若下次查询时命中，则不会向 API 服务商发送请求

## 技术栈

- nest(Node.js)
- MongoDB

