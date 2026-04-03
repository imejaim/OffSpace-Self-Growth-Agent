module.exports = {
  apps: [
    {
      name: 'intercept',
      cwd: 'C:/Project/18_OffSpace_Self_Growth_Agent/intercept',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4000',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      // 자동 재시작
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 3000,
      // 로그
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      // 메모리 초과 시 재시작
      max_memory_restart: '500M',
      // 비정상 종료 시 재시작
      watch: false,
    },
  ],
}
