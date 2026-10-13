const path = require('path');

module.exports = {
  apps: [
    {
      name: 'ishtari-api',
      script: path.join(__dirname, 'src', 'server.js'),
      cwd: __dirname, // so dotenv finds api-nodejs/.env
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10, // stop crash loops instead of restarting forever
      min_uptime: '10s', // a run shorter than this counts as a failed start
      restart_delay: 2000,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
      out_file: path.join(__dirname, 'logs', 'out.log'),
      error_file: path.join(__dirname, 'logs', 'error.log'),
      merge_logs: true,
      time: true, // timestamp every log line
    },
  ],
};
