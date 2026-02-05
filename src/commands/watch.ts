import chalk from 'chalk';
import ora from 'ora';
import { getConnections, getBackups, triggerBackup, type Backup } from '../utils/api.js';
import { printError, colors, formatBytes, formatRelativeTime } from '../utils/ui.js';
import { isAuthenticated, getConfig } from '../utils/config.js';

interface WatchOptions {
  org?: string;
  interval?: string;
}

export async function watchCommand(options: WatchOptions): Promise<void> {
  if (!isAuthenticated()) {
    printError('Not authenticated. Run `butterfly login` first.');
    process.exit(1);
  }

  const intervalMinutes = parseInt(options.interval || '60', 10);
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log();
  console.log(chalk.bold('🦋 Butterfly Watch Mode'));
  console.log(colors.muted(`Monitoring for changes every ${intervalMinutes} minutes`));
  console.log(colors.muted('Press Ctrl+C to stop'));
  console.log();

  // Get connection to watch
  const spinner = ora('Finding connection...').start();

  try {
    const { connections } = await getConnections();

    if (connections.length === 0) {
      spinner.fail('No Okta connections found');
      return;
    }

    // Find matching connection
    const orgFilter = options.org || getConfig('defaultOrg');
    let connection = connections[0];

    if (orgFilter) {
      const match = connections.find(
        (c) =>
          c.org_url.includes(orgFilter) ||
          c.org_name?.toLowerCase().includes(orgFilter.toLowerCase())
      );
      if (match) {
        connection = match;
      }
    }

    spinner.succeed(`Watching: ${chalk.cyan(connection.org_name || connection.org_url)}`);
    console.log();

    let lastBackup: Backup | null = null;

    // Initial check
    const { backups } = await getBackups(connection.id);
    if (backups.length > 0) {
      lastBackup = backups[0];
      printBackupStatus(lastBackup);
    }

    // Watch loop
    const checkForChanges = async () => {
      const timestamp = new Date().toLocaleTimeString();
      console.log(colors.muted(`[${timestamp}] Checking for changes...`));

      try {
        // Trigger a new backup
        const result = await triggerBackup(connection.id, {
          resourceTypes: ['users', 'groups', 'apps', 'policies'],
        });
        const newBackup = result.backup;

        // Wait for backup to complete (poll every 5 seconds)
        let completedBackup = newBackup;
        let attempts = 0;
        const maxAttempts = 60; // 5 minute timeout

        while (completedBackup.status === 'running' && attempts < maxAttempts) {
          await sleep(5000);
          const { backups: updated } = await getBackups(connection.id);
          const found = updated.find((b) => b.id === newBackup.id);
          if (found) {
            completedBackup = found;
          }
          attempts++;
        }

        if (completedBackup.status === 'completed') {
          // Compare with previous backup
          if (lastBackup) {
            const changes = detectChanges(lastBackup, completedBackup);
            if (changes.length > 0) {
              console.log();
              console.log(chalk.yellow('⚠️  Changes detected!'));
              for (const change of changes) {
                console.log(`  ${colors.muted('•')} ${change}`);
              }
              console.log();
            } else {
              console.log(colors.muted(`[${timestamp}] No changes detected`));
            }
          }

          lastBackup = completedBackup;
          printBackupStatus(completedBackup);
        } else if (completedBackup.status === 'failed') {
          console.log(chalk.red(`[${timestamp}] Backup failed`));
        }
      } catch (error) {
        console.log(chalk.red(`[${timestamp}] Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    // Run first check
    await checkForChanges();

    // Schedule periodic checks
    const intervalId = setInterval(checkForChanges, intervalMs);

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      clearInterval(intervalId);
      console.log();
      console.log(colors.muted('Watch mode stopped.'));
      process.exit(0);
    });

    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    spinner.fail('Watch failed');
    printError(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

function printBackupStatus(backup: Backup): void {
  const counts = backup.resource_counts || {};
  const resources = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ');

  console.log();
  console.log(colors.muted('┌' + '─'.repeat(50) + '┐'));
  console.log(colors.muted('│') + chalk.bold(' Latest Backup').padEnd(50) + colors.muted('│'));
  console.log(colors.muted('├' + '─'.repeat(50) + '┤'));
  console.log(colors.muted('│') + `  ID: ${chalk.cyan(backup.id.slice(0, 8))}...`.padEnd(50) + colors.muted('│'));
  console.log(colors.muted('│') + `  Time: ${formatRelativeTime(backup.timestamp)}`.padEnd(50) + colors.muted('│'));
  console.log(colors.muted('│') + `  Status: ${backup.status === 'completed' ? chalk.green('✓') : chalk.yellow('○')} ${backup.status}`.padEnd(50) + colors.muted('│'));
  console.log(colors.muted('│') + `  Size: ${formatBytes(backup.size_bytes)}`.padEnd(50) + colors.muted('│'));
  console.log(colors.muted('│') + `  Resources: ${resources || 'none'}`.padEnd(50) + colors.muted('│'));
  console.log(colors.muted('└' + '─'.repeat(50) + '┘'));
  console.log();
}

function detectChanges(oldBackup: Backup, newBackup: Backup): string[] {
  const changes: string[] = [];
  const oldCounts = oldBackup.resource_counts || {};
  const newCounts = newBackup.resource_counts || {};

  const allKeys = new Set([...Object.keys(oldCounts), ...Object.keys(newCounts)]);

  for (const key of allKeys) {
    const oldVal = oldCounts[key] || 0;
    const newVal = newCounts[key] || 0;

    if (newVal > oldVal) {
      changes.push(`${key}: +${newVal - oldVal} (${oldVal} → ${newVal})`);
    } else if (newVal < oldVal) {
      changes.push(`${key}: -${oldVal - newVal} (${oldVal} → ${newVal})`);
    }
  }

  return changes;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
