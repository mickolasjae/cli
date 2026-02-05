import chalk from 'chalk';
import ora from 'ora';
import { getBackups, getDiff, type DiffChange } from '../utils/api.js';
import {
  printError,
  colors,
  createTable,
  getActionColor,
} from '../utils/ui.js';
import { isAuthenticated } from '../utils/config.js';

interface DiffOptions {
  from?: string;
  to?: string;
  type?: string;
  json?: boolean;
}

export async function diffCommand(options: DiffOptions): Promise<void> {
  if (!isAuthenticated()) {
    printError('Not authenticated. Run `butterfly login` first.');
    process.exit(1);
  }

  const spinner = ora('Fetching diff...').start();

  try {
    // If no backups specified, get the two most recent
    let fromBackup = options.from;
    let toBackup = options.to;

    if (!fromBackup || !toBackup) {
      spinner.text = 'Finding recent backups...';

      // We need a connection ID - for now, get the first connection's backups
      const { connections } = await import('../utils/api.js').then(m => m.getConnections());

      if (connections.length === 0) {
        spinner.fail('No Okta connections found');
        return;
      }

      const { backups } = await getBackups(connections[0].id);

      if (backups.length < 2) {
        spinner.fail('Need at least 2 backups to compare');
        console.log(colors.muted(`Run ${chalk.cyan('butterfly backup')} to create more backups.`));
        return;
      }

      // Default: compare latest with previous
      toBackup = toBackup || backups[0].id;
      fromBackup = fromBackup || backups[1].id;
    }

    spinner.text = `Comparing ${fromBackup.slice(0, 8)}... → ${toBackup.slice(0, 8)}...`;

    const { changes, summary } = await getDiff(fromBackup, toBackup);

    // Filter by type if specified
    let filteredChanges = changes;
    if (options.type) {
      filteredChanges = changes.filter(
        (c) => c.resourceType.toLowerCase() === options.type!.toLowerCase()
      );
    }

    spinner.stop();

    // JSON output
    if (options.json) {
      console.log(JSON.stringify({ changes: filteredChanges, summary }, null, 2));
      return;
    }

    console.log();
    console.log(chalk.bold('Backup Diff'));
    console.log(colors.muted(`From: ${fromBackup.slice(0, 8)}...  →  To: ${toBackup.slice(0, 8)}...`));
    console.log();

    // Summary stats
    const summaryLine = [
      summary.added > 0 ? chalk.green(`+${summary.added} added`) : null,
      summary.modified > 0 ? chalk.yellow(`~${summary.modified} modified`) : null,
      summary.removed > 0 ? chalk.red(`-${summary.removed} removed`) : null,
    ]
      .filter(Boolean)
      .join('  ');

    if (summaryLine) {
      console.log(summaryLine);
      console.log();
    }

    if (filteredChanges.length === 0) {
      console.log(colors.muted('No changes detected.'));
      return;
    }

    // Group changes by resource type
    const grouped = new Map<string, DiffChange[]>();
    for (const change of filteredChanges) {
      const existing = grouped.get(change.resourceType) || [];
      existing.push(change);
      grouped.set(change.resourceType, existing);
    }

    // Display changes by type
    for (const [type, typeChanges] of grouped) {
      console.log(chalk.bold.white(`${type.toUpperCase()}`));

      const table = createTable(['Action', 'Name', 'Details']);

      for (const change of typeChanges) {
        const actionColor = getActionColor(change.action);
        const actionSymbol =
          change.action === 'added' ? '+' :
          change.action === 'removed' ? '-' : '~';

        table.push([
          actionColor(`${actionSymbol} ${change.action}`),
          change.resourceName,
          change.details || '-',
        ]);
      }

      console.log(table.toString());
      console.log();
    }

    // Tip
    console.log(
      colors.muted(
        `Use ${chalk.cyan('butterfly diff --type users')} to filter by resource type.`
      )
    );
  } catch (error) {
    spinner.fail('Failed to generate diff');
    printError(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
