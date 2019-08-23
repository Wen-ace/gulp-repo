- ### start command

    * #### gulp

    > 开启开发模式， 静态资源不会添加hash值。
    


    * #### gulp build

    > 生产打包，静态资源添加会添加cdn路径和hash串。

- ### gulp 配置 gulpfile.js 内部简略说明

    > isHttps:  是否开启https 服务

    > isMock: 是否使用Mock数据，mock数据模拟输出在httpMock.js文件中配置

    > cdnUrl: 静态资源cdn路径

