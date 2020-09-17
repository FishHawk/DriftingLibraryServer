import moment from 'moment';
import winston from 'winston';

const format = winston.format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const timestamp = winston.format((info, opts) => {
  info.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  return info;
});

export const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      format: winston.format.combine(timestamp(), format),
      filename: 'log/info.log',
    }),
  ],
});
