const mix = require('laravel-mix')
mix.react('src/app.js', "dist/").sass("resources/sass/app.scss", "dist/")
mix.setPublicPath("dist")

mix.webpackConfig({
    externals: [(function() {
        var IGNORES = ["ws", "electron"];
        return function(context, request, callback) {
            if (IGNORES.indexOf(request) >= 0) {
                return callback(null, "require('" + request + "')");
            }
            return callback();
        };
    })()],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env']
                  }
                }
              }
        ]
    }
    // module: {
    //     rules: [{
    //             test: /.jsx?$/,
               
    //             exclude: /node_modules/,
    //             use: {
    //                 loader: "babel-loader"
    //             }
    //         }, {
    //             test: /\.css$/,
    //             use: [{
    //                 loader: "style-loader"
    //             }, {
    //                 loader: "css-loader"
    //             }, {
    //                 loader: "resolve-url-loader"
    //             }]
    //         }, {
    //             test: /\.(scss|sass)$/,
    //             use: [
    //                 {
    //                     loader: "style-loader"
    //                 }, {
    //                     loader: "css-loader"
    //                 }, {
    //                     loader: "resolve-url-loader"
    //                 },
    //                 {
    //                     loader: "sass-loader"
    //                 }
    //             ]
    //         }, {
    //             test: /\.(eot|svg|ttf|woff|woff2)$/,
    //             //loader: 'file?name=/dist/fonts/[name].[ext]'
    //             use: {
    //                 loader: "resolve-url-loader"
    //             }
    //         }
    //         /*{
    //                                                                               test: /\.(woff|woff2)$/,
    //                                                                               use: {
    //                                                                                   loader: "file-loader",
    //                                                                                   options: {
    //                                                                                       name: "./dist/fonts/[hash].[ext]",
    //                                                                                       limit: 5000,
    //                                                                                       mimetype: "application/font-woff"
    //                                                                                   }
    //                                                                               }
    //                                                                           },
    //                                                                           {
    //                                                                               test: /\.(ttf|eot|svg)$/,
    //                                                                               use: {
    //                                                                                   loader: "file-loader",
    //                                                                                   options: {
    //                                                                                       name: "fonts/[hash].[ext]"
    //                                                                                   }
    //                                                                               }
    //                                                                           }*/
    //     ]
    // }
})

