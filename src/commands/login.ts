import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { setApiKey, clearConfig, isAuthenticated, getApiUrl } from '../utils/config.js';
import { printSuccess, printError, printInfo, box } from '../utils/ui.js';

interface LoginOptions {
  apiKey?: string;
  interactive?: boolean;
}

export async function loginCommand(options: LoginOptions): Promise<void> {
  console.log();
  console.log(chalk.cyan.bold('🦋 Butterfly Security CLI'));
  console.log();

  if (options.apiKey) {
    // Direct API key login
    await loginWithApiKey(options.apiKey);
    return;
  }

  if (options.interactive) {
    // Browser-based login
    await interactiveLogin();
    return;
  }

  // Prompt for method
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'How would you like to authenticate?',
      choices: [
        { name: 'Enter API key', value: 'apikey' },
        { name: 'Login via browser', value: 'browser' },
      ],
    },
  ]);

  if (method === 'apikey') {
    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Enter your API key:',
        mask: '*',
      },
    ]);
    await loginWithApiKey(apiKey);
  } else {
    await interactiveLogin();
  }
}

async function loginWithApiKey(apiKey: string): Promise<void> {
  const spinner = ora('Validating API key...').start();

  try {
    // Validate the API key by making a test request
    const response = await fetch(`${getApiUrl()}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      spinner.fail('Invalid API key');
      printError('The API key provided is invalid or expired.');
      printInfo('Get your API key from: https://butterflysecurity.org/dashboard/settings');
      return;
    }

    const data = await response.json() as { email?: string; user?: { email?: string } };
    spinner.succeed('API key validated');

    // Save the API key
    setApiKey(apiKey);

    console.log();
    printSuccess(`Logged in as ${chalk.cyan(data.email || data.user?.email || 'user')}`);
    console.log();
    console.log(
      box(
        `You're all set! Try these commands:\n\n` +
          `  ${chalk.cyan('butterfly status')}     Show backup status\n` +
          `  ${chalk.cyan('butterfly backup')}     Trigger a backup\n` +
          `  ${chalk.cyan('butterfly list')}       List all backups\n` +
          `  ${chalk.cyan('butterfly --help')}     Show all commands`,
        'Getting Started'
      )
    );
  } catch (error) {
    spinner.fail('Authentication failed');
    printError(error instanceof Error ? error.message : 'Unknown error');
  }
}

async function interactiveLogin(): Promise<void> {
  const apiUrl = getApiUrl();
  const loginUrl = `${apiUrl}/login?cli=true`;

  printInfo(`Opening browser to: ${chalk.cyan(loginUrl)}`);
  console.log();
  console.log(chalk.gray('If the browser doesn\'t open, visit the URL above manually.'));
  console.log();

  // Try to open browser
  const open = await import('open').then((m) => m.default).catch(() => null);
  if (open) {
    await open(loginUrl);
  }

  // Wait for user to complete login and provide token
  const { token } = await inquirer.prompt([
    {
      type: 'password',
      name: 'token',
      message: 'Paste the CLI token from your browser:',
      mask: '*',
    },
  ]);

  await loginWithApiKey(token);
}

export async function logout(): Promise<void> {
  if (!isAuthenticated()) {
    printInfo('You are not logged in.');
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to log out?',
      default: false,
    },
  ]);

  if (confirm) {
    clearConfig();
    printSuccess('Logged out successfully');
  }
}
