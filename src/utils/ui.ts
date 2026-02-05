import chalk from 'chalk';
import boxen from 'boxen';
import Table from 'cli-table3';

// Colors matching Butterfly Security brand
export const colors = {
  primary: chalk.cyan,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.blue,
  muted: chalk.gray,
  highlight: chalk.white.bold,
};

// Status indicators
export const status = {
  active: chalk.green('●'),
  inactive: chalk.gray('○'),
  warning: chalk.yellow('●'),
  error: chalk.red('●'),
  protected: chalk.green('● PROTECTED'),
};

// Format bytes
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Format date
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

// Format relative time
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

// Create a styled box
export function box(content: string, title?: string): string {
  return boxen(content, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    title,
    titleAlignment: 'left',
  });
}

// Create a table
export function createTable(headers: string[]): Table.Table {
  return new Table({
    head: headers.map((h) => colors.primary(h)),
    style: {
      head: [],
      border: ['gray'],
    },
  });
}

// Print status display (like the mockup image)
export function printStatusDisplay(
  orgName: string,
  orgUrl: string,
  stats: {
    users: number;
    groups?: number;
    apps: number;
    flows: number;
    policies?: number;
  },
  lastBackup: string | null,
  coverage: number,
  terraformReady: boolean
): void {
  const width = 60;

  // Header line
  console.log();
  console.log(colors.muted('─'.repeat(width)));

  // Org name with status
  const orgDisplay = `║ ${chalk.bold(orgName.toUpperCase())}  ${status.protected} ║`;
  console.log(colors.primary(orgDisplay));

  console.log(colors.muted('─'.repeat(width)));
  console.log();

  // Stats in columns
  const statsLine = [
    `${colors.primary(stats.users.toString().padStart(6))}`,
    `${colors.info(stats.apps.toString().padStart(6))}`,
    `${colors.highlight(stats.flows.toString().padStart(6))}`,
  ].join('    ');

  const labelsLine = [
    `${colors.muted('USERS'.padStart(6))}`,
    `${colors.muted('APPS'.padStart(6))}`,
    `${colors.muted('FLOWS'.padStart(6))}`,
  ].join('    ');

  console.log(statsLine);
  console.log(labelsLine);
  console.log();

  // Last backup
  const lastBackupDisplay = lastBackup
    ? formatRelativeTime(lastBackup)
    : 'never';
  console.log(
    `${colors.muted('LAST_BACKUP:')} ${colors.success(lastBackupDisplay)}`
  );

  // Status bar
  const barWidth = 40;
  const filledWidth = Math.round((coverage / 100) * barWidth);
  const bar =
    colors.primary('█'.repeat(filledWidth)) +
    colors.muted('░'.repeat(barWidth - filledWidth));
  console.log(`${colors.muted('STATUS:')} ${bar} ${colors.success(coverage + '%')}`);

  // Coverage
  console.log(
    `${colors.muted('COVERAGE:')} ${colors.success('45+ resource types')}`
  );

  console.log();

  // Terraform badge if ready
  if (terraformReady) {
    console.log(
      boxen(`${chalk.magenta('TF')}  TERRAFORM\n    ${colors.success('EXPORT_READY')}`, {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        borderStyle: 'round',
        borderColor: 'magenta',
        float: 'right',
      })
    );
  }

  // Encryption badge
  console.log(
    `${colors.muted('🔒')} ${colors.highlight('ENCRYPTION')}  ${colors.success('AES-256-GCM')}`
  );

  console.log();
}

// Severity colors
export function severityColor(severity: string): typeof chalk.red {
  switch (severity) {
    case 'critical':
      return chalk.red.bold;
    case 'high':
      return chalk.red;
    case 'medium':
      return chalk.yellow;
    case 'low':
      return chalk.blue;
    default:
      return chalk.gray;
  }
}

// Action colors
export function actionColor(action: string): typeof chalk.red {
  switch (action) {
    case 'added':
      return chalk.green;
    case 'removed':
      return chalk.red;
    case 'modified':
      return chalk.yellow;
    default:
      return chalk.gray;
  }
}

// Alias for backward compatibility
export const getActionColor = actionColor;

// Print error
export function printError(message: string): void {
  console.error(chalk.red('✖ Error:'), message);
}

// Print success
export function printSuccess(message: string): void {
  console.log(chalk.green('✔'), message);
}

// Print warning
export function printWarning(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

// Print info
export function printInfo(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}
