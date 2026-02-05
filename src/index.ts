#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { loginCommand, logout } from './commands/login.js';
import { statusCommand } from './commands/status.js';
import { backupCommand } from './commands/backup.js';
import { listCommand } from './commands/list.js';
import { diffCommand } from './commands/diff.js';
import { exportTerraformCommand, exportGitCommand } from './commands/export.js';
import { configShowCommand, configSetCommand, configResetCommand, configEditCommand } from './commands/config.js';
import { watchCommand } from './commands/watch.js';
import { selectCommand, getSelectedBackup, clearSelectedBackup } from './commands/select.js';
import { version } from './utils/version.js';
import { colors } from './utils/ui.js';

const program = new Command();

// Custom help formatting
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name() + (cmd.alias() ? `|${cmd.alias()}` : ''),
});

program
  .name('butterfly')
  .description(`${chalk.cyan('🦋 Butterfly Security CLI')} - Okta backup and recovery from your terminal

${chalk.bold('Quick Start:')}
  $ butterfly login           # Authenticate with your API key
  $ butterfly status          # View your Okta backup status
  $ butterfly backup --wait   # Create a new backup
  $ butterfly list            # See all your backups
  $ butterfly diff            # Compare recent changes

${chalk.bold('Learn More:')}
  Documentation: ${chalk.cyan('https://butterflysecurity.org/docs')}
  Dashboard:     ${chalk.cyan('https://butterflysecurity.org/dashboard')}`)
  .version(version, '-v, --version', 'Display version number')
  .addHelpText('after', `
${chalk.bold('Examples:')}
  ${colors.muted('# Check backup status')}
  $ butterfly status --org acme.okta.com

  ${colors.muted('# Create a backup and wait for it to complete')}
  $ butterfly backup --wait

  ${colors.muted('# Export the latest backup as Terraform')}
  $ butterfly export terraform --output ./my-terraform

  ${colors.muted('# Watch for configuration changes')}
  $ butterfly watch --interval 30
`);

// ============================================
// AUTHENTICATION
// ============================================
program
  .command('login')
  .description('Authenticate with Butterfly Security')
  .option('-k, --api-key <key>', 'API key (get from Dashboard → Settings)')
  .option('-i, --interactive', 'Open browser for interactive login')
  .addHelpText('after', `
${chalk.bold('Examples:')}
  $ butterfly login                      # Interactive prompt
  $ butterfly login --api-key sk_xxx     # Direct API key
  $ butterfly login --interactive        # Browser-based login

${chalk.bold('Get your API key:')}
  Visit ${chalk.cyan('https://butterflysecurity.org/dashboard/settings')}
`)
  .action(loginCommand);

program
  .command('logout')
  .description('Log out and clear stored credentials')
  .addHelpText('after', `
This will remove your API key from local storage.
You'll need to run ${chalk.cyan('butterfly login')} again to use the CLI.
`)
  .action(logout);

// ============================================
// STATUS & INFO
// ============================================
program
  .command('status')
  .description('Show backup status and protection summary')
  .option('-o, --org <org>', 'Filter by specific Okta org URL or name')
  .option('-j, --json', 'Output as JSON for scripting')
  .addHelpText('after', `
${chalk.bold('Examples:')}
  $ butterfly status                     # All orgs
  $ butterfly status --org acme          # Specific org
  $ butterfly status --json | jq .       # JSON output
`)
  .action(statusCommand);

program
  .command('whoami')
  .description('Show current authentication status')
  .action(async () => {
    const { statusCommand } = await import('./commands/status.js');
    await statusCommand({ json: false });
  });

// ============================================
// BACKUP OPERATIONS
// ============================================
program
  .command('backup')
  .description('Trigger a new backup of your Okta configuration')
  .option('-o, --org <org>', 'Specific Okta org (defaults to all connected orgs)')
  .option('-r, --resources <list>', 'Comma-separated resources: users,groups,apps,policies')
  .option('--include-workflows', 'Include Okta Workflows (requires separate auth)')
  .option('-w, --wait', 'Wait for backup to complete before returning')
  .addHelpText('after', `
${chalk.bold('Examples:')}
  $ butterfly backup                            # Quick backup, returns immediately
  $ butterfly backup --wait                     # Wait for completion
  $ butterfly backup -r users,groups --wait     # Backup specific resources
  $ butterfly backup --include-workflows        # Include Okta Workflows

${chalk.bold('Resource types:')}
  users, groups, apps, policies, authServers, identityProviders,
  networkZones, trustedOrigins, authenticators, brands, and more...
`)
  .action(backupCommand);

program
  .command('list')
  .alias('ls')
  .description('List recent backups')
  .option('-o, --org <org>', 'Filter by Okta org')
  .option('-n, --limit <number>', 'Number of backups to show (default: 10)')
  .option('-j, --json', 'Output as JSON')
  .addHelpText('after', `
${chalk.bold('Examples:')}
  $ butterfly list                       # Recent backups
  $ butterfly ls --limit 20              # Show more
  $ butterfly list --org acme            # Filter by org
  $ butterfly list --json                # JSON for scripting
`)
  .action(listCommand);

// ============================================
// SELECT & FOCUS
// ============================================
program
  .command('select')
  .description('Select a backup to work with (for diff, export, etc.)')
  .argument('[backup-id]', 'Backup ID to select (interactive picker if omitted)')
  .option('-o, --org <org>', 'Filter backups by org')
  .option('-c, --clear', 'Clear the current selection')
  .addHelpText('after', `
${chalk.bold('Examples:')}
  $ butterfly select                     # Interactive picker
  $ butterfly select abc123              # Select by ID
  $ butterfly select --clear             # Clear selection
  $ butterfly selected                   # Show current selection

${chalk.bold('Why select?')}
  Selected backup is used as default for ${chalk.cyan('diff')}, ${chalk.cyan('export')}, and other commands.
`)
  .action(async (backupId, options) => {
    if (options.clear) {
      clearSelectedBackup();
      return;
    }
    await selectCommand(backupId, options);
  });

program
  .command('selected')
  .description('Show the currently selected backup')
  .action(() => {
    const selected = getSelectedBackup();
    if (selected) {
      console.log();
      console.log(chalk.bold('Currently Selected Backup'));
      console.log();
      console.log(`  ${colors.muted('ID:')}    ${chalk.cyan(selected.id)}`);
      console.log(`  ${colors.muted('Org:')}   ${selected.orgName}`);
      console.log(`  ${colors.muted('Date:')}  ${selected.timestamp}`);
      console.log();
      console.log(colors.muted(`Use ${chalk.cyan('butterfly select --clear')} to deselect.`));
    } else {
      console.log();
      console.log(colors.muted('No backup selected.'));
      console.log();
      console.log(`Run ${chalk.cyan('butterfly select')} to choose a backup to work with.`);
      console.log(colors.muted('The selected backup will be used for diff, export, and other commands.'));
    }
  });

// ============================================
// DIFF & COMPARE
// ============================================
program
  .command('diff')
  .description('Compare two backups and show what changed')
  .option('-f, --from <id>', 'Starting backup ID (older)')
  .option('-t, --to <id>', 'Ending backup ID (newer, or uses selected backup)')
  .option('--type <type>', 'Filter: users, groups, apps, policies')
  .option('-j, --json', 'Output as JSON')
  .addHelpText('after', `
${chalk.bold('Examples:')}
  $ butterfly diff                       # Compare latest two backups
  $ butterfly diff --from abc --to xyz   # Compare specific backups
  $ butterfly diff --type users          # Only show user changes
  $ butterfly diff --json                # JSON for scripting

${chalk.bold('Tip:')}
  Use ${chalk.cyan('butterfly select')} first to set a baseline backup.
`)
  .action(diffCommand);

// ============================================
// EXPORT COMMANDS
// ============================================
const exportCmd = program
  .command('export')
  .description('Export backup data in various formats')
  .addHelpText('after', `
${chalk.bold('Available formats:')}
  ${chalk.cyan('terraform')}  Export as Terraform HCL (Infrastructure as Code)
  ${chalk.cyan('git')}        Push to GitHub, GitLab, Bitbucket, or Azure DevOps
  ${chalk.cyan('json')}       Export as raw JSON files

${chalk.bold('Examples:')}
  $ butterfly export terraform
  $ butterfly export git
  $ butterfly export terraform --output ./my-iac
`);

exportCmd
  .command('terraform')
  .alias('tf')
  .description('Export backup as Terraform HCL files')
  .option('-b, --backup <id>', 'Backup ID (uses selected or latest if omitted)')
  .option('-o, --output <path>', 'Output directory', './terraform-export')
  .option('-r, --resources <list>', 'Resources to export: users,groups,apps,policies')
  .addHelpText('after', `
${chalk.bold('Examples:')}
  $ butterfly export terraform
  $ butterfly export tf --output ./infra
  $ butterfly export terraform -r users,groups

${chalk.bold('Next steps after export:')}
  $ cd ./terraform-export
  $ terraform init
  $ terraform plan
`)
  .action(exportTerraformCommand);

exportCmd
  .command('git')
  .description('Export backup to a Git repository')
  .option('-b, --backup <id>', 'Backup ID (uses selected or latest if omitted)')
  .addHelpText('after', `
${chalk.bold('Supported providers:')}
  • GitHub
  • GitLab
  • Bitbucket
  • Azure DevOps

${chalk.bold('Note:')}
  You'll need to connect your Git provider first in the Dashboard.
  Visit ${chalk.cyan('https://butterflysecurity.org/dashboard/connections')}
`)
  .action(exportGitCommand);

exportCmd
  .command('json')
  .description('Export backup as JSON files')
  .option('-b, --backup <id>', 'Backup ID (uses selected or latest if omitted)')
  .option('-o, --output <path>', 'Output directory', './json-export')
  .action(async () => {
    console.log(colors.muted('JSON export coming soon...'));
    console.log();
    console.log(`For now, use ${chalk.cyan('butterfly export terraform')} or ${chalk.cyan('butterfly export git')}`);
  });

// ============================================
// CONFIGURATION
// ============================================
const configCmd = program
  .command('config')
  .description('Manage CLI configuration')
  .addHelpText('after', `
${chalk.bold('Available commands:')}
  ${chalk.cyan('show')}    Display current configuration
  ${chalk.cyan('set')}     Set a configuration value
  ${chalk.cyan('edit')}    Interactive configuration editor
  ${chalk.cyan('reset')}   Reset to defaults

${chalk.bold('Examples:')}
  $ butterfly config show
  $ butterfly config set defaultOrg acme.okta.com
`);

configCmd
  .command('show')
  .description('Display current configuration')
  .option('-j, --json', 'Output as JSON')
  .action(configShowCommand);

configCmd
  .command('set')
  .description('Set a configuration value')
  .argument('<key>', 'Config key: apiUrl, defaultOrg')
  .argument('<value>', 'New value')
  .addHelpText('after', `
${chalk.bold('Available keys:')}
  ${chalk.cyan('apiUrl')}      API endpoint URL
  ${chalk.cyan('defaultOrg')}  Default Okta org for commands

${chalk.bold('Examples:')}
  $ butterfly config set defaultOrg acme.okta.com
`)
  .action(configSetCommand);

configCmd
  .command('reset')
  .description('Reset all configuration to defaults')
  .action(configResetCommand);

configCmd
  .command('edit')
  .description('Interactively edit configuration')
  .action(configEditCommand);

// ============================================
// WATCH MODE
// ============================================
program
  .command('watch')
  .description('Continuously monitor for configuration changes')
  .option('-o, --org <org>', 'Specific Okta org to watch')
  .option('-i, --interval <minutes>', 'Check interval in minutes', '60')
  .addHelpText('after', `
${chalk.bold('Examples:')}
  $ butterfly watch                      # Check every 60 minutes
  $ butterfly watch --interval 30        # Check every 30 minutes
  $ butterfly watch --org acme           # Watch specific org

${chalk.bold('How it works:')}
  1. Creates periodic backups at the specified interval
  2. Compares each backup to detect changes
  3. Alerts you when configuration drift is detected

Press ${chalk.cyan('Ctrl+C')} to stop watching.
`)
  .action(watchCommand);

// ============================================
// PARSE & RUN
// ============================================

// Show help if no command provided
if (process.argv.length === 2) {
  program.outputHelp();
  process.exit(0);
}

program.parse();
