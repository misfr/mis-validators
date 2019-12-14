/**
 * WebPack configuration for building tests
 * @author Frederic BAYLE
 */

const TerserPlugin = require("terser-webpack-plugin");

function getEnvParameters(env) {
  if(env != "prod" && env != "dev") {
    throw "Invalid env : prod || dev";
  }

  return {
    mode: env == "prod" ? "production" : "development",
    optimization: {
      minimize: env == "prod" ? true : false
    },
  }
}

module.exports = (env) => {
  return {
    target: "node",
    mode: getEnvParameters(env).mode,
    entry: {
      "dist/mis-validators.bundle": "./src/bundle.ts"
    },
    output: {
      filename: "[name].js",
      path: __dirname
    },
    module: {
      rules: [
        { 
          test: /\.ts$/, 
          exclude: /node_modules/,
          loader: 'ts-loader'
        }       
      ]
    },
    optimization: {
      minimizer: [
        new TerserPlugin()
      ],
      minimize: getEnvParameters(env).optimization.minimize
    },
    resolve: {
      extensions: ['.js', '.ts']
    }
  }
};
