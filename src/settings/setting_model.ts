import { isNumber, isString, Sanitizer } from '@util/validator/sanitizer';
import { validateNumber, Validator } from '@util/validator/validator';

export type Settings = {
  downloadConcurrent: number;
  bilibiliCookie: string | undefined;
};

export const defaultSettings: Settings = {
  downloadConcurrent: 5,
  bilibiliCookie: undefined,
};

export type SettingModel = {
  [P in keyof Settings]:
    | [Sanitizer<Settings[P]>, Validator<Settings[P]>]
    | [Sanitizer<Settings[P]>];
};

export const settingModel: SettingModel = {
  downloadConcurrent: [isNumber(), validateNumber().isInteger().limit(0, 5)],
  bilibiliCookie: [isString()],
};
