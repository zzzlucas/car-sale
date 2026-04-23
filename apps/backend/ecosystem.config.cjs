module.exports = {
  apps: [
    {
      name: 'car-platform-backend',
      cwd: __dirname,
      script: './bootstrap.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      time: true,
      env: {
        NODE_ENV: 'prod',
        TZ: 'Asia/Shanghai',
        PORT: '8120',
      },
    },
  ],
};
