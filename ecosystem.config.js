module.exports = {
  apps: [
    {
      name: "feral-pure-internet",
      script: "./packages/app/dist/index.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        WEBHOOK_SECRET: "your-secret-here",
      },
    },
  ],
};
