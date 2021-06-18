import fs from 'fs/promises';

import * as fsu from '@util/fs';

import { defaultSettings } from './setting_model';
import { parseInputSettings } from './setting_parser';

export class SettingLoader {
  static settings = defaultSettings;

  static async fromFile(filepath: string) {
    const input = await fsu.readJSON(filepath);
    SettingLoader.settings = parseInputSettings(defaultSettings, input);

    if (input === undefined)
      await fs.writeFile(filepath, JSON.stringify(SettingLoader.settings));
  }
}

export default SettingLoader.settings;
