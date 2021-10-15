#DEPRECATED

因为typescript不能满足项目的需要，该项目已经用kotlin重写了。新的项目地址为https://github.com/FishHawk/lisu.

# DriftingLibraryServer

DriftingLibrary是一个免费的漫画库管理系统，该存储库包含DriftingLibrary后端服务器的代码。

Android：https://github.com/FishHawk/DriftingLibraryAndroid

## 特征

- 基于系统目录管理漫画，你可以在文件管理器中直接编辑漫画库。
- 支持三种漫画文件结构：
  - 三级目录：Manga -> Collection -> Chapter
  - 二级目录：Collection -> Chapter
  - 一级目录：Chapter
- 提供其他漫画源，支持在线阅读、下载和订阅。漫画源列表：
  - [x] 哔哩哔哩漫画
  - [x] 动漫之家
  - [x] 漫画人
  - [ ] e-hentai
  - [ ] exhentai

## 快速开始

### Docker

```bash
docker build https://github.com/FishHawk/DriftingLibraryServer.git -t manga:latest
docker run -d -p 8080:8080 --name=manga --restart=always -v /home/wh/manga:/data manga:latest
```

### App

#### 编译

```bash
cd DriftingLibraryServer
npm install
npm run build
```

#### 运行

```bash
export APP_PORT=8080                  # 服务器端口号，应当在1024到65535之间，例如8080。
export APP_LIBRARY_DIR=/home/xx/xx    # 库目录，存放漫画的文件夹路径，文件夹必须存在。
npm start
```

使用浏览器访问 http://localhost:8080/test ，如果显示“Hello World!”，说明服务器正常启动。
