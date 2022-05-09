# PT-Gen on AWS Lambda
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FLeiShi1313%2Fpt-gen-cfworker.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FLeiShi1313%2Fpt-gen-cfworker?ref=badge_shield)

基于 [Rhilip/pt-gen-cfworker](https://github.com/Rhilip/pt-gen-cfworker) 改写，
使之可以直接在AWS Lambda上使用。

## 部署本项目

### 安装serverless
```shell
npm install -g serverless
serverless --version
```

### 安装依赖
```shell
npm install
serverless dynamodb install
```

### 本地测试
```shell
serverless offline start
```

### 部署到Lambda
```shell
serverless deploy
```

## 本项目请求方法

`简介生成` 请求字段（方法1，推荐）：
  - url：见下表 `链接格式（Regexp）`

## 支持资源链接

| 资源来源站点 | 搜索支持 | 链接格式（Regexp） |
| :---: | :---: | :------|
| douban | √ | `/(?:https?:\/\/)?(?:(?:movie\|www)\.)?douban\.com\/(?:subject\|movie)\/(\d+)\/?/` |
| imdb | √ | `/(?:https?:\/\/)?(?:www\.)?imdb\.com\/title\/(tt\d+)\/?/` |
| bangumi | √ | `/(?:https?:\/\/)?(?:bgm\.tv\|bangumi\.tv\|chii\.in)\/subject\/(\d+)\/?/` |
| steam | × | `/(?:https?:\/\/)?(?:store\.)?steam(?:powered\|community)\.com\/app\/(\d+)\/?/` |
| indienova | × | `/(?:https?:\/\/)?indienova\.com\/game\/(\S+)/` | 
| epic | × | `/(?:https?:\/\/)?www\.epicgames\.com\/store\/[a-zA-Z-]+\/product\/(\S+)\/\S?/` |

## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FLeiShi1313%2Fpt-gen-cfworker.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FLeiShi1313%2Fpt-gen-cfworker?ref=badge_large)