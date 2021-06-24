import moment from 'moment';
import winston from 'winston';

const format = winston.format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const timestamp = winston.format((info, opts) => {
  info.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  return info;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(timestamp(), format),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'log/run.log' }),
  ],
});

export default logger;
