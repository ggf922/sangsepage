module.exports = {
  apps: [
    {
      name: "sangsepage",
      script: "npm",
      args: "run start",
      cwd: "/home/user/webapp",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      watch: false,
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "1G",
      error_file: "/home/user/webapp/logs/pm2-error.log",
      out_file: "/home/user/webapp/logs/pm2-out.log",
      merge_logs: true,
    },
  ],
};
