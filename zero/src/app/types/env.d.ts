declare namespace NodeJS {
  interface ProcessEnv {
    DVR_IP: string;
    DVR_USER: string;
    DVR_PASS: string;
    NODE_ENV: 'development' | 'production';
  }
}