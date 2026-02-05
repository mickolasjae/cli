import chalk from 'chalk';
import ora from 'ora';
import { getConnections, getBackups, type Backup } from '../utils/api.js';
import {
  printError,
  colors,
  formatBytes,
  formatRelativeTime,
  createTable,
} from '../utils/ui.js';
import { isAuthenticated } from '../utils/config.js';

interface ListOptions {
  org?: string;
  limit?: string;
  json?: boolean;
}

export async function listCommand(options: ListOptions): Promise<void> {
  if (!isAuthenticated()) {
    printError('Not authenticated. Run `butterfly login` first.');
    process.exit(1);
  }

  const spinner = ora('Fetching backups...').start();
  const limit = parseInt(options.limit || '10', 10);

  try {
    // Get connections
    const { connections } = await getConnections();

    if (connections.length === 0) {
      spinner.fail('No Okta connections found');
      return;
    }

    // Filter by org if specified
    let connectionIds: string[] = connections.map((c) => c.id);

    if (options.org) {
      const match = connections.find(
        (c) =>
          c.org_url.includes(options.org!) ||
          c.org_name?.toLowerCase().includes(options.org!.toLowerCase())
      );

      if (!match) {
        spinner.fail(`No connection found matching "${options.org}"`);
        return;
      }
      connectionIds = [match.id];
    }

    // Fetch backups
    const allBackups: Array<Backup & { orgName: string }> = [];

    for (const connectionId of connectionIds) {
      const { backups } = await getBackups(connectionId);
      const connection = connections.find((c) => c.id === connectionId);
      const orgName = connection?.org_name || connection?.org_url || 'Unknown';

      for (const backup of backups) {
        allBackups.push({ ...backup, orgName });
      }
    }

    // Sort by timestamp (newest first)
    allBackups.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limit results
    const limitedBackups = allBackups.slice(0, limit);

    spinner.stop();

    // JSON output
    if (options.json) {
      console.log(JSON.stringify(limitedBackups, null, 2));
      return;
    }

    if (limitedBackups.length === 0) {
      console.log();
      console.log(colors.muted('No backups found.'));
      console.log(colors.muted(`Run ${chalk.cyan('butterfly backup')} to create your first backup.`));
      return;
    }

    // Table output
    console.log();
    console.log(chalk.bold(`Recent Backups (${limitedBackups.length} of ${allBackups.length})`));
    console.log();

    const table = createTable(['ID', 'Org', 'Date', 'Status', 'Resources', 'Size']);

    for (const backup of limitedBackups) {
      const counts = backup.resource_counts || {};
      const resourceSummary = Object.entries(counts)
        .filter(([, v]) => v > 0)
        .slice(0, 3)
        .map(([k, v]) => `${v} ${k}`)
        .join(', ');

      const statusColor =
        backup.status === 'completed'
          ? chalk.green
          : backup.status === 'running'
          ? chalk.cyan
          : chalk.red;

      table.push([
        colors.muted(backup.id.slice(0, 8) + '...'),
        backup.orgName,
        formatRelativeTime(backup.timestamp),
        statusColor(backup.status),
        resourceSummary || '-',
        formatBytes(backup.size_bytes),
      ]);
    }

    console.log(table.toString());

    console.log();
    console.log(
      colors.muted(
        `Use ${chalk.cyan('butterfly diff')} to compare backups, or ${chalk.cyan('butterfly export <format> -b <id>')} to export.`
      )
    );
  } catch (error) {
    spinner.fail('Failed to fetch backups');
    printError(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
