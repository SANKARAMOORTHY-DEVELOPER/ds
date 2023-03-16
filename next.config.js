require("dotenv").config({ path: ".env" });

const getEnv = (variable, optional = false) => {
  if (!process.env[variable]) {
    if (optional) {
      console.warn(
        `[@env]: Environmental variable for ${variable} is not supplied.`
      );
    } else {
      throw new Error(
        `You must create an environment variable for ${variable}`
      );
    }
  }

  return process.env[variable]?.replace(/\\n/gm, "\n");
};

const PROJECT_ID = getEnv("PROJECT_ID");
const PROJECT_API = getEnv("PROJECT_API");

module.exports = {
  target: "serverless",
  env: {
    PROJECT_ID: PROJECT_ID,
    PROJECT_SECRET: PROJECT_API,
  },
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^electron$/ })
    );
    config.resolve = {
      ...config.resolve,
      fallback: {
        fs: false,
        path: false,
        os: false,
        net: false,
        crypto: require.resolve("crypto-browserify"),
        querystring: require.resolve("query-string"),
        stream: "stream-browserify",
        https: "agent-base",
        http: false,
      },
    };
    return config;
  },
};
