import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { getConnections, triggerBackup, getBackup, type Connection } from '../utils/api.js';
import { printError, printSuccess, printInfo, colors, formatBytes } from '../utils/ui.js';
import { isAuthenticated } from '../utils/config.js';

interface BackupOptions {
  org?: string;
  resources?: string;
  includeWorkflows?: boolean;
  wait?: boolean;
}

const RESOURCE_CATEGORIES = [
  { name: 'Core Identity (users, groups, groupRules)', value: 'core', resources: ['users', 'groups', 'groupRules'] },
  { name: 'Applications (apps, oauthClients)', value: 'apps', resources: ['apps', 'oauthClients'] },
  { name: 'Policies (sign-on, MFA, password)', value: 'policies', resources: ['policies'] },
  { name: 'Security (network zones, authenticators)', value: 'security', resources: ['networkZones', 'trustedOrigins', 'authenticators'] },
  { name: 'Authorization (auth servers, IdPs, roles)', value: 'auth', resources: ['authorizationServers', 'identityProviders', 'roles'] },
  { name: 'Workflows', value: 'workflows', resources: ['workflows'] },
];

export async function backupCommand(options: BackupOptions): Promise<void> {
  if (!isAuthenticated()) {
    printError('Not authenticated. Run `butterfly login` first.');
    process.exit(1);
  }

  const spinner = ora('Loading connections...').start();

  try {
    // Get connections
    const { connections } = await getConnections();

    if (connections.length === 0) {
      spinner.fail('No Okta connections found');
      printInfo('Connect your first Okta org at: https://butterflysecurity.org/dashboard/connections/new');
      return;
    }

    spinner.stop();

    // Select connection
    let targetConnection: Connection;

    if (options.org) {
      const match = connections.find(
        (c) =>
          c.org_url.includes(options.org!) ||
          c.org_name?.toLowerCase().includes(options.org!.toLowerCase())
      );

      if (!match) {
        printError(`No connection found matching "${options.org}"`);
        return;
      }
      targetConnection = match;
    } else if (connections.length === 1) {
      targetConnection = connections[0];
    } else {
      const { connectionId } = await inquirer.prompt([
        {
          type: 'list',
          name: 'connectionId',
          message: 'Select Okta org to backup:',
          choices: connections.map((c) => ({
            name: `${c.org_name || c.org_url} ${c.is_active ? chalk.green('(active)') : chalk.gray('(inactive)')}`,
            value: c.id,
          })),
        },
      ]);
      targetConnection = connections.find((c) => c.id === connectionId)!;
    }

    // Select resources
    let resources: string[] = [];

    if (options.resources) {
      resources = options.resources.split(',').map((r) => r.trim());
    } else {
      const { categories } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'categories',
          message: 'Select resources to backup:',
          choices: RESOURCE_CATEGORIES.map((cat) => ({
            name: cat.name,
            value: cat.value,
            checked: cat.value !== 'workflows', // All except workflows by default
          })),
        },
      ]);

      // Flatten selected categories into resources
      for (const cat of categories) {
        const category = RESOURCE_CATEGORIES.find((c) => c.value === cat);
        if (category) {
          resources.push(...category.resources);
        }
      }
    }

    const includeWorkflows = options.includeWorkflows || resources.includes('workflows');

    // Confirm
    console.log();
    printInfo(`Org: ${chalk.cyan(targetConnection.org_name || targetConnection.org_url)}`);
    printInfo(`Resources: ${chalk.cyan(resources.length)} types`);
    if (includeWorkflows) {
      printInfo(`Workflows: ${chalk.cyan('included')}`);
    }
    console.log();

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Start backup?',
        default: true,
      },
    ]);

    if (!confirm) {
      printInfo('Backup cancelled');
      return;
    }

    // Trigger backup
    const backupSpinner = ora('Starting backup...').start();

    const result = await triggerBackup(
      targetConnection.id,
      {
        resourceTypes: resources.filter((r) => r !== 'workflows'),
        includeWorkflows,
      }
    );

    if (!result.success) {
      backupSpinner.fail('Backup failed to start');
      return;
    }

    backupSpinner.succeed('Backup started');
    printInfo(`Backup ID: ${chalk.cyan(result.backupId)}`);

    // Wait for completion if requested
    if (options.wait) {
      const waitSpinner = ora('Waiting for backup to complete...').start();

      let status = 'running';
      let backup;

      while (status === 'running') {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
          backup = await getBackup(result.backupId);
          status = backup.status;

          if (status === 'running') {
            const counts = backup.resource_counts || {};
            const total = Object.values(counts).reduce((a, b) => a + b, 0);
            waitSpinner.text = `Backing up... ${total} resources collected`;
          }
        } catch {
          // Backup might not be ready yet
        }
      }

      if (status === 'completed') {
        waitSpinner.succeed('Backup completed');

        if (backup) {
          console.log();
          console.log(colors.muted('─'.repeat(40)));
          console.log(chalk.bold('Backup Summary'));
          console.log(colors.muted('─'.repeat(40)));

          const counts = backup.resource_counts || {};
          for (const [key, value] of Object.entries(counts)) {
            if (value > 0) {
              console.log(`  ${colors.muted(key.padEnd(20))} ${colors.success(value.toString())}`);
            }
          }

          console.log(colors.muted('─'.repeat(40)));
          console.log(`  ${colors.muted('Size'.padEnd(20))} ${colors.success(formatBytes(backup.size_bytes))}`);
          console.log();
        }
      } else {
        waitSpinner.fail(`Backup ${status}`);
      }
    } else {
      console.log();
      printInfo(`Run ${chalk.cyan(`butterfly list --org ${targetConnection.org_url}`)} to check progress`);
    }
  } catch (error) {
    printError(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
