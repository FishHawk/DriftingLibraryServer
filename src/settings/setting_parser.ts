import { logger } from '../logger';
import { Sanitizer } from '../util/validator/sanitizer';
import { Validator } from '../util/validator/validator';

import { SettingModel, settingModel, Settings } from './setting_model';

export function parseInputSettings(settings: Settings, input: unknown) {
  if (typeof input === 'object' && input !== null) {
    for (const key in settingModel) {
      loadSetting(
        settings,
        input as Record<string, unknown>,
        key as keyof SettingModel
      );
    }
  } else {
    logger.warn('Can not parse setting file');
  }
  return settings;
}

function loadSetting<K extends keyof Settings>(
  settings: Settings,
  input: Record<K, unknown>,
  key: K
) {
  const sanitizer = settingModel[key][0] as Sanitizer<Settings[K]>;
  const validator = settingModel[key][1] as Validator<Settings[K]> | undefined;
  const value = input[key];

  if (
    sanitizer(value) &&
    (validator === undefined || validator.validate(value))
  )
    settings[key] = value;
  else logger.warn(`Setting ${key} is illegal`);
}
