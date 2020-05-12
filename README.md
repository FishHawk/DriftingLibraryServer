# DriftingLibraryServer

这是漂流图书馆的服务器端，包含一个express服务器和一个基于electron的启动器。

## 如何运行

### GUI

对于Windows 8.1及以上的用户，可以使用启动器来启动服务器。运行`drifting-library.exe`，进入启动器并填写参数。

- `端口`：服务器端口，端口号应当在1024到65535之间（比如8080）。
- `库目录`：存放漫画的文件夹路径（比如E:\library），文件夹必须存在。

输入参数正确并点击启动，就可以启动服务器，启动后服务器的日志会输出在下面，如下图所示。如果要关闭服务器，关闭窗口即可。

如果想检测服务器是否启动，可以打开浏览器访问`http://localhost:8080/test`。如果显示Hello World!，则服务器运行正常。

<img src="https://raw.githubusercontent.com/wiki/FishHawk/DriftingLibraryServer/Home.assets/screenshot.png" alt="screenshot" style="zoom:67%;" />

### 命令行

按以下步骤启动服务器。

1. 安装[nodejs](https://nodejs.org/zh-cn/)。

2. 下载本项目，进入项目文件夹，打开命令行。（对于Windows用户，在项目文件夹，按住shift并点击右键，选择打开cmd或者打开powershell即可）

3. 运行指令`npm install`。（国内一般需要从镜像安装electron。如果使用的是cmd，需要先执行`set ELECTRON_MIRROR=https://npm.taobao.org/mirrors/electron/ `，如果使用的是powershell，需要先执行`$env:ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/" `）

4. 运行指令`node server/index.js [port] [address]`，port是端口号，address是库文件夹，文件夹必须存在。例如：`node server/index.js 8080 E:\library`。

   

## 如何建立漫画库

漫画库的管理基于系统目录，库文件夹下的每个子文件夹代表一本漫画。一个典型的漫画文件夹内容如下：

```
BLAME!
├── metadata.json
├── thumb.jpg
├── 单行本
│   ├── 第1卷
│   ├── 第2卷
│   ├── ...
│   ├── 第9卷
│   └── 第10卷
└── 画集
    └── BLAME! and so on
```

### 元数据

`thumb.jpg`是该漫画的缩略图，支持`jpg,png,jpeg`三种后缀名。

`metadata.json`包含本漫画的元信息，一个典型的`metadata.json`内容如下：

```json
{
    "title": "BLAME！",
    "tags": [
        {
            "key": "作者",
            "value": ["弐瓶勉"]
        },
        {
            "key": "关键字",
            "value": ["氛围", "科幻"]
        }
    ]
}
```

title字段不是必须的，如果没有，默认使用文件夹名作为漫画标题。设置此字段是因为某些漫画标题包含特殊字符。如果`metadata.json`的内容有变化，需要重启服务器。

### 内容

漫画内容的解析根据`manga`文件夹下的子文件夹层数不同而不同，规则如下。

- 如果`manga`文件夹下的子文件夹有两层，将按照`manga->collection->chapter的`顺序解析。
- 如果`manga`文件夹下的子文件夹有一层，将按照`manga->chapter的`顺序解析。
- 如果`manga`文件夹下没有子文件夹，则直接吧`manga`文件夹当作`chapter`文件夹解析。

```
manga->collection->chapter
BLAME!
├── 单行本
│   ├── 第1卷
│   ├── ...
│   └── 第10卷
└── 画集
    └── BLAME! and so on
    
manga->chapter
炎拳
├── 第1话
├── ...
└── 第83话
```

图片直接放在`chapter`文件夹下，不支持压缩包，不要在`chapter`文件夹下存放图片以外的文件。