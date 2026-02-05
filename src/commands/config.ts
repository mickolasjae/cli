import chalk from 'chalk';
import inquirer from 'inquirer';
import {
  getConfig,
  setConfig,
  clearConfig,
  getApiKey,
  getApiUrl,
  getDefaultOrg,
} from '../utils/config.js';
import { printSuccess, printError, colors } from '../utils/ui.js';

interface ConfigOptions {
  json?: boolean;
}

export async function configShowCommand(options: ConfigOptions): Promise<void> {
  const config = {
    apiUrl: getApiUrl(),
    defaultOrg: getDefaultOrg(),
    hasApiKey: !!getApiKey(),
  };

  if (options.json) {
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  console.log();
  console.log(chalk.bold('Current Configuration'));
  console.log();
  console.log(`  ${colors.muted('API URL:')}      ${chalk.cyan(config.apiUrl)}`);
  console.log(`  ${colors.muted('Default Org:')}  ${config.defaultOrg ? chalk.cyan(config.defaultOrg) : colors.muted('not set')}`);
  console.log(`  ${colors.muted('API Key:')}      ${config.hasApiKey ? chalk.green('configured') : chalk.yellow('not configured')}`);
  console.log();
  console.log(colors.muted(`Config location: ${chalk.white('~/.config/butterfly-cli/config.json')}`));
}

export async function configSetCommand(key: string, value: string): Promise<void> {
  const validKeys = ['apiUrl', 'defaultOrg'];

  if (!validKeys.includes(key)) {
    printError(`Invalid config key: ${key}`);
    console.log(colors.muted(`Valid keys: ${validKeys.join(', ')}`));
    process.exit(1);
  }

  setConfig(key as 'apiUrl' | 'defaultOrg', value);
  printSuccess(`Set ${key} = ${value}`);
}

export async function configResetCommand(): Promise<void> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'This will clear all configuration including your API key. Continue?',
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(colors.muted('Cancelled.'));
    return;
  }

  clearConfig();
  printSuccess('Configuration reset to defaults');
}

export async function configEditCommand(): Promise<void> {
  const currentApiUrl = getApiUrl();
  const currentDefaultOrg = getDefaultOrg();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiUrl',
      message: 'API URL:',
      default: currentApiUrl,
    },
    {
      type: 'input',
      name: 'defaultOrg',
      message: 'Default Okta org (optional):',
      default: currentDefaultOrg || '',
    },
  ]);

  if (answers.apiUrl !== currentApiUrl) {
    setConfig('apiUrl', answers.apiUrl);
  }

  if (answers.defaultOrg !== (currentDefaultOrg || '')) {
    if (answers.defaultOrg) {
      setConfig('defaultOrg', answers.defaultOrg);
    } else {
      // Clear default org if empty
      setConfig('defaultOrg', '');
    }
  }

  printSuccess('Configuration updated');
}
