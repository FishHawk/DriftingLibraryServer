import { isNumber, isString, Sanitizer } from '../util/validator/sanitizer';
import { validateNumber, Validator } from '../util/validator/validator';

export type Settings = {
  port: number;
  downloadConcurrent: number;
  bilibiliCookie: string | undefined;
};

export const defaultSettings: Settings = {
  port: 8080,
  downloadConcurrent: 5,
  bilibiliCookie: undefined,
};

export type SettingModel = {
  [P in keyof Settings]:
    | [Sanitizer<Settings[P]>, Validator<Settings[P]>]
    | [Sanitizer<Settings[P]>];
};

export const settingModel: SettingModel = {
  port: [isNumber(), validateNumber().isInteger().limit(1024, 65535)],
  downloadConcurrent: [isNumber(), validateNumber().isInteger().limit(0, 5)],
  bilibiliCookie: [isString()],
};
