const isProd=process.env.NODE_ENV==='production';
const MiniCssExtractPlugin=require('mini-css-extract-plugin'); // 文本分离插件，分离js和css
const path=require('path');
/**
 *  css和stylus开发、生产依赖
 *  生产分离css
 */
const cssConfig=[isProd?MiniCssExtractPlugin.loader:'vue-style-loader',{
        loader: 'css-loader',
        options: {
            minimize: isProd,
            sourceMap: !isProd
        }
    },'postcss-loader'];
const stylusConfig=[isProd?MiniCssExtractPlugin.loader:'vue-style-loader',{
        loader: 'css-loader',
        options: {
            minimize: isProd,
            sourceMap: !isProd
        }
    },{
        loader: 'stylus-loader',
        options: {
            sourceMap: !isProd
        }
    }];
const webpack=require('webpack');
const HtmlWebpackPlugin=require('html-webpack-plugin'); // 自动生成index.html
const CleanWebpackPlugin=require('clean-webpack-plugin'); // 清理垃圾文件

const VueLoaderPlugin = require('vue-loader/lib/plugin'); // vue加载器
const PostStylus=require('poststylus'); // stylus加前缀

module.exports = {
    entry: {
        main: './src/main.js', // 入口文件
        vendor: ['axios'] // 打包第三方库放在vendor.js中
    },
    output: {
        path: path.resolve(__dirname, 'dist'), // 打包目录
        filename: isProd?'javascript/[name].[hash:8].js':'[name].js', // [name] 是entry的key
        publicPath: isProd?'./':'/'
    },
    devtool: isProd?false:'eval-source-map', // 如果只用source-map开发环境出现错误定位源文件，生产环境会生成map文件
    module: {
        rules: [
            {
                test: /\.css$/,
                use:cssConfig
            },
            {
                test: /\.styl(us)?$/,
                use: stylusConfig
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    hotReload: true, // 热重载
                    loaders:{
                        css: cssConfig,
                        stylus: stylusConfig
                    }
                },
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query:{
                    presets: ['env']
                },
                exclude: file => (
                    /node_modules/.test(file) &&
                    !/\.vue\.js/.test(file)
                )
            },
            {
                test: /\.(png|jpe?g|gif|bmp|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: { // 配置图片编译路径
                        limit: 8192, // 小于8k将图片转换成base64
                        name: '[name].[hash:8].[ext]',
                        outputPath: 'images/'
                        }
                    },
                    {
                        loader: 'image-webpack-loader', // 图片压缩
                        options: {
                            bypassOnDebug: true
                        }
                    }]
            },
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: { // 配置html中图片编译
                        minimize: true
                    }
                }]
            },
            {
                test: /\.(mp4|ogg|svg)$/,use: ['file-loader']
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 8192,
                    name: 'fonts/[name].[hash:8].[ext]'
                }
            }
        ]
    },
    devServer:isProd?{}:{
        contentBase: path.join(__dirname, 'dist') // 将 dist 目录下的文件，作为可访问文件。
        ,compress: true // 开启Gzip压缩
        ,host: 'localhost' // 设置服务器的ip地址，默认localhost
        ,port: 3000 // 端口号
        ,open: true // 自动打开浏览器
    },
    resolve: {
        extensions: ['.js', '.vue', '.styl'], // import引入文件的时候不用加后缀
        modules: [ // 配置路径别名
            'node_modules'
            ,path.resolve(__dirname, 'src/components')
            ,path.resolve(__dirname, 'src/assets')
        ]
    },
    plugins: [
        new VueLoaderPlugin(), // vue加载器
        new webpack.BannerPlugin(`xs build at ${Date.now()}`), // 打包后在.js/.css页头的时间（并没什么卵用）
        new CleanWebpackPlugin([path.join(__dirname, isProd?'dist':'')]), // 每次打包之前清理打包目录
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/index.html') // 引入模版
            ,favicon: path.join(__dirname, 'src/assets/icon/favicon.ico')
            ,filename: 'index.html'
            ,minify: { // 对index.html压缩
                collapseWhitespace: isProd // 去掉index.html的空格
                ,removeAttributeQuotes: isProd // 去掉引号
            }
            ,hash: true // 去掉上次浏览器的缓存（使浏览器每次获取到的是最新的html）
        }),
        new MiniCssExtractPlugin({ // 分离css
            filename: isProd?'stylesheets/[name].[hash:8].css':'[name].css',
            allChunks: true
        }),
        new webpack.NamedModulesPlugin(), // 热更新 HMR
        new webpack.HotModuleReplacementPlugin(), // 热加载插件 HMR
        new webpack.LoaderOptionsPlugin({ // stylus加前缀
            options: {
                stylus: {
                    use: [
                        PostStylus(['autoprefixer']),
                    ]
                },
                babel: {
                    presets: ['es2015'],
                    plugins: ['transform-runtime']
                }
            }
        }),
        new webpack.ProvidePlugin({ // 配置第三方库
            $http: 'axios' // 在.vue文件中可以使用$http发送请求，不用每次都import Axios from 'axios';也不用挂载到vue原型链上
        })
    ],
    optimization: {
        splitChunks: {
            cacheGroups:{ // 这里开始设置缓存的 chunks
                vendor: { // key 为entry中定义的 入口名称
                    chunks: 'initial', // 必须三选一： "initial" | "all" | "async"(默认就是异步)
                    test: /node_modules/, // 正则规则验证，如果符合就提取 chunk (指定是node_modules下的第三方包)
                    name: 'vendor', // 要缓存的 分隔出来的 chunk 名称
                    minChunks: 1,
                    enforce: true
                },
                styles: {
                    chunks: 'all',
                    test: /\.(css|styl)$/,
                    name: 'vendor',
                    minChunks: 1,
                    enforce: true
                }
            }
        }
    }
}
