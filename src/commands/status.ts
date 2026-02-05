import chalk from 'chalk';
import ora from 'ora';
import { getConnections, getBackups, type Connection, type Backup } from '../utils/api.js';
import {
  printError,
  printStatusDisplay,
  colors,
  formatRelativeTime,
  formatBytes,
  createTable,
  box,
} from '../utils/ui.js';
import { isAuthenticated } from '../utils/config.js';

interface StatusOptions {
  org?: string;
  json?: boolean;
}

export async function statusCommand(options: StatusOptions): Promise<void> {
  if (!isAuthenticated()) {
    printError('Not authenticated. Run `butterfly login` first.');
    process.exit(1);
  }

  const spinner = ora('Fetching status...').start();

  try {
    // Fetch connections
    const { connections } = await getConnections();

    if (connections.length === 0) {
      spinner.stop();
      console.log();
      console.log(
        box(
          `No Okta connections found.\n\n` +
            `Connect your first Okta org at:\n` +
            `${chalk.cyan('https://butterflysecurity.org/dashboard/connections/new')}`,
          'Get Started'
        )
      );
      return;
    }

    // Filter by org if specified
    let targetConnections = connections;
    if (options.org) {
      targetConnections = connections.filter(
        (c) =>
          c.org_url.includes(options.org!) ||
          c.org_name?.toLowerCase().includes(options.org!.toLowerCase())
      );

      if (targetConnections.length === 0) {
        spinner.fail(`No connection found matching "${options.org}"`);
        return;
      }
    }

    // Fetch backups for each connection
    const connectionData: Array<{
      connection: Connection;
      backups: Backup[];
      latestBackup: Backup | null;
    }> = [];

    for (const connection of targetConnections) {
      const { backups } = await getBackups(connection.id);
      connectionData.push({
        connection,
        backups,
        latestBackup: backups[0] || null,
      });
    }

    spinner.stop();

    // JSON output
    if (options.json) {
      console.log(JSON.stringify(connectionData, null, 2));
      return;
    }

    // Pretty output
    console.log();

    for (const { connection, backups, latestBackup } of connectionData) {
      const orgName = connection.org_name || connection.org_url.replace('https://', '').replace('.okta.com', '');

      // Calculate stats from latest backup
      const stats = latestBackup?.resource_counts || {
        users: 0,
        groups: 0,
        apps: 0,
        workflows: 0,
        policies: 0,
      };

      // Terminal-style status display (like the mockup)
      console.log(colors.muted('┌' + '─'.repeat(60) + '┐'));
      console.log(colors.muted('│') + ` > butterfly status --org ${connection.org_url}`.padEnd(60) + colors.muted('│'));
      console.log(colors.muted('│') + ' '.repeat(60) + colors.muted('│'));

      // Org name with protected status
      const statusIndicator = connection.is_active
        ? chalk.green('● PROTECTED')
        : chalk.red('● INACTIVE');
      console.log(
        colors.muted('│') +
          colors.primary(' ║ ') +
          chalk.bold(orgName.toUpperCase()) +
          '  ' +
          statusIndicator +
          colors.primary(' ║').padEnd(50) +
          colors.muted('│')
      );

      console.log(colors.muted('│') + ' '.repeat(60) + colors.muted('│'));

      // Stats row
      const usersStr = (stats.users || 0).toString().padStart(8);
      const appsStr = (stats.apps || 0).toString().padStart(8);
      const flowsStr = (stats.workflows || 0).toString().padStart(8);

      console.log(
        colors.muted('│') +
          `     ${colors.primary(usersStr)}      ${colors.info(appsStr)}       ${colors.highlight(flowsStr)}` +
          ' '.repeat(15) +
          colors.muted('│')
      );
      console.log(
        colors.muted('│') +
          `     ${colors.muted('USERS')}         ${colors.muted('APPS')}         ${colors.muted('FLOWS')}` +
          ' '.repeat(15) +
          colors.muted('│')
      );

      console.log(colors.muted('│') + ' '.repeat(60) + colors.muted('│'));

      // Last backup
      const lastBackupStr = latestBackup
        ? formatRelativeTime(latestBackup.timestamp)
        : 'never';
      console.log(
        colors.muted('│') +
          ` LAST_BACKUP: ${colors.success(lastBackupStr)}`.padEnd(60) +
          colors.muted('│')
      );

      // Status bar
      const coverage = latestBackup ? 100 : 0;
      const barWidth = 40;
      const filledWidth = Math.round((coverage / 100) * barWidth);
      const bar =
        colors.success('█'.repeat(filledWidth)) +
        colors.muted('░'.repeat(barWidth - filledWidth));
      console.log(
        colors.muted('│') +
          ` STATUS: ${bar} ${colors.success(coverage + '%')}` +
          colors.muted('│')
      );

      // Coverage
      console.log(
        colors.muted('│') +
          ` COVERAGE: ${colors.success('45+ resource types')}`.padEnd(60) +
          colors.muted('│')
      );

      console.log(colors.muted('│') + ' '.repeat(60) + colors.muted('│'));

      // Encryption
      console.log(
        colors.muted('│') +
          ` 🔒 ${colors.highlight('ENCRYPTION')}  ${colors.success('AES-256-GCM')}`.padEnd(55) +
          colors.muted('│')
      );

      console.log(colors.muted('└' + '─'.repeat(60) + '┘'));

      // Terraform badge (to the side)
      if (latestBackup) {
        console.log(
          '  ' +
            chalk.magenta('┌───────────────────┐')
        );
        console.log(
          '  ' +
            chalk.magenta('│') +
            chalk.magentaBright.bold(' TF ') +
            chalk.white('TERRAFORM') +
            '     ' +
            chalk.magenta('│')
        );
        console.log(
          '  ' +
            chalk.magenta('│') +
            '    ' +
            chalk.green('EXPORT_READY') +
            '   ' +
            chalk.magenta('│')
        );
        console.log(
          '  ' +
            chalk.magenta('└───────────────────┘')
        );
      }

      console.log();
    }

    // Summary if multiple orgs
    if (connectionData.length > 1) {
      const table = createTable(['Org', 'Status', 'Last Backup', 'Backups', 'Size']);

      for (const { connection, backups, latestBackup } of connectionData) {
        const totalSize = backups.reduce((acc, b) => acc + (b.size_bytes || 0), 0);
        table.push([
          connection.org_name || connection.org_url,
          connection.is_active ? chalk.green('Active') : chalk.gray('Inactive'),
          latestBackup ? formatRelativeTime(latestBackup.timestamp) : 'Never',
          backups.length.toString(),
          formatBytes(totalSize),
        ]);
      }

      console.log(table.toString());
    }
  } catch (error) {
    spinner.fail('Failed to fetch status');
    printError(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
