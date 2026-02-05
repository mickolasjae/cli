import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { getConnections, getBackups, type Backup } from '../utils/api.js';
import { printError, printSuccess, colors, formatBytes, formatRelativeTime } from '../utils/ui.js';
import { isAuthenticated, setConfig, getConfig } from '../utils/config.js';

interface SelectOptions {
  org?: string;
}

interface SelectedBackup {
  id: string;
  orgName: string;
  timestamp: string;
  connectionId: string;
}

export function getSelectedBackup(): SelectedBackup | null {
  const selected = getConfig('selectedBackup');
  return selected || null;
}

export function setSelectedBackup(backup: SelectedBackup): void {
  setConfig('selectedBackup', backup);
}

export function clearSelectedBackup(): void {
  setConfig('selectedBackup', null);
  printSuccess('Backup selection cleared');
}

export async function selectCommand(backupId?: string, options?: SelectOptions): Promise<void> {
  if (!isAuthenticated()) {
    printError('Not authenticated. Run `butterfly login` first.');
    process.exit(1);
  }

  const spinner = ora('Fetching backups...').start();

  try {
    const { connections } = await getConnections();

    if (connections.length === 0) {
      spinner.fail('No Okta connections found');
      return;
    }

    // Filter by org if specified
    let filteredConnections = connections;
    if (options?.org) {
      filteredConnections = connections.filter(
        (c) =>
          c.org_url.includes(options.org!) ||
          c.org_name?.toLowerCase().includes(options.org!.toLowerCase())
      );

      if (filteredConnections.length === 0) {
        spinner.fail(`No connection found matching "${options.org}"`);
        return;
      }
    }

    // Gather all backups
    const allBackups: Array<Backup & { orgName: string; connectionId: string }> = [];

    for (const connection of filteredConnections) {
      const { backups } = await getBackups(connection.id);
      const orgName = connection.org_name || connection.org_url || 'Unknown';

      for (const backup of backups) {
        allBackups.push({ ...backup, orgName, connectionId: connection.id });
      }
    }

    // Sort by timestamp (newest first)
    allBackups.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    spinner.stop();

    if (allBackups.length === 0) {
      console.log(colors.muted('No backups found.'));
      console.log(colors.muted(`Run ${chalk.cyan('butterfly backup')} to create your first backup.`));
      return;
    }

    // If backupId provided, select it directly
    if (backupId) {
      const backup = allBackups.find(
        (b) => b.id === backupId || b.id.startsWith(backupId)
      );

      if (!backup) {
        printError(`Backup not found: ${backupId}`);
        return;
      }

      setSelectedBackup({
        id: backup.id,
        orgName: backup.orgName,
        timestamp: backup.timestamp,
        connectionId: backup.connectionId,
      });

      printSelectedBackup(backup);
      return;
    }

    // Interactive selection
    console.log();
    console.log(chalk.bold('Select a backup to focus on'));
    console.log(colors.muted('This backup will be used for diff, export, and other operations.'));
    console.log();

    const choices = allBackups.slice(0, 20).map((backup) => {
      const counts = backup.resource_counts || {};
      const resourceSummary = Object.entries(counts)
        .filter(([, v]) => v > 0)
        .slice(0, 3)
        .map(([k, v]) => `${v} ${k}`)
        .join(', ');

      const statusIcon = backup.status === 'completed' ? chalk.green('✓') : chalk.red('✗');
      const shortId = backup.id.slice(0, 8);

      return {
        name: `${statusIcon} ${chalk.cyan(shortId)} ${colors.muted('│')} ${backup.orgName} ${colors.muted('│')} ${formatRelativeTime(backup.timestamp)} ${colors.muted('│')} ${resourceSummary || 'no data'} ${colors.muted('│')} ${formatBytes(backup.size_bytes)}`,
        value: backup,
        short: shortId,
      };
    });

    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Choose a backup:',
        choices,
        pageSize: 15,
      },
    ]);

    setSelectedBackup({
      id: selected.id,
      orgName: selected.orgName,
      timestamp: selected.timestamp,
      connectionId: selected.connectionId,
    });

    printSelectedBackup(selected);
  } catch (error) {
    spinner.fail('Failed to fetch backups');
    printError(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

function printSelectedBackup(backup: Backup & { orgName: string }): void {
  console.log();
  console.log(chalk.green('✓') + chalk.bold(' Backup selected'));
  console.log();
  console.log(colors.muted('┌' + '─'.repeat(50) + '┐'));
  console.log(colors.muted('│') + chalk.bold(' Selected Backup').padEnd(50) + colors.muted('│'));
  console.log(colors.muted('├' + '─'.repeat(50) + '┤'));
  console.log(colors.muted('│') + `  ID:   ${chalk.cyan(backup.id.slice(0, 8))}...`.padEnd(50) + colors.muted('│'));
  console.log(colors.muted('│') + `  Org:  ${backup.orgName}`.padEnd(50) + colors.muted('│'));
  console.log(colors.muted('│') + `  Date: ${formatRelativeTime(backup.timestamp)}`.padEnd(50) + colors.muted('│'));
  console.log(colors.muted('│') + `  Size: ${formatBytes(backup.size_bytes)}`.padEnd(50) + colors.muted('│'));
  console.log(colors.muted('└' + '─'.repeat(50) + '┘'));
  console.log();
  console.log(colors.muted('This backup will be used for subsequent operations.'));
  console.log(colors.muted(`Run ${chalk.cyan('butterfly select --clear')} to deselect.`));
}
