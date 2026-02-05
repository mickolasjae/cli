import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { getConnections, getBackups, exportTerraform, exportToGit } from '../utils/api.js';
import { printError, printSuccess, colors, formatBytes } from '../utils/ui.js';
import { isAuthenticated } from '../utils/config.js';
import fs from 'fs';
import path from 'path';

interface ExportOptions {
  backup?: string;
  output?: string;
  resources?: string;
}

export async function exportTerraformCommand(options: ExportOptions): Promise<void> {
  if (!isAuthenticated()) {
    printError('Not authenticated. Run `butterfly login` first.');
    process.exit(1);
  }

  const spinner = ora('Preparing export...').start();

  try {
    let backupId = options.backup;

    // If no backup specified, find the latest
    if (!backupId) {
      spinner.text = 'Finding latest backup...';
      const { connections } = await getConnections();

      if (connections.length === 0) {
        spinner.fail('No Okta connections found');
        return;
      }

      const { backups } = await getBackups(connections[0].id);

      if (backups.length === 0) {
        spinner.fail('No backups found');
        console.log(colors.muted(`Run ${chalk.cyan('butterfly backup')} first.`));
        return;
      }

      backupId = backups[0].id;
    }

    // Parse resource types
    const resourceTypes = options.resources
      ? options.resources.split(',').map((r) => r.trim())
      : ['users', 'groups', 'apps', 'policies'];

    spinner.text = `Exporting backup ${backupId.slice(0, 8)}... as Terraform...`;

    const { files, totalSize } = await exportTerraform(backupId, resourceTypes);

    spinner.stop();

    // Determine output directory
    const outputDir = options.output || './terraform-export';

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write files
    for (const file of files) {
      const filePath = path.join(outputDir, file.name);
      fs.writeFileSync(filePath, file.content);
    }

    console.log();
    printSuccess(`Exported ${files.length} Terraform files`);
    console.log();

    console.log(chalk.bold('Files created:'));
    for (const file of files) {
      console.log(`  ${colors.muted('•')} ${chalk.cyan(file.name)} ${colors.muted(`(${formatBytes(file.content.length)})`)}`);
    }
    console.log();
    console.log(colors.muted(`Output directory: ${chalk.white(outputDir)}`));
    console.log(colors.muted(`Total size: ${chalk.white(formatBytes(totalSize))}`));
    console.log();
    console.log(colors.muted('Next steps:'));
    console.log(colors.muted(`  ${chalk.cyan('cd ' + outputDir)}`));
    console.log(colors.muted(`  ${chalk.cyan('terraform init')}`));
    console.log(colors.muted(`  ${chalk.cyan('terraform plan')}`));
  } catch (error) {
    spinner.fail('Export failed');
    printError(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

export async function exportGitCommand(options: ExportOptions): Promise<void> {
  if (!isAuthenticated()) {
    printError('Not authenticated. Run `butterfly login` first.');
    process.exit(1);
  }

  const spinner = ora('Preparing Git export...').start();

  try {
    let backupId = options.backup;

    // If no backup specified, find the latest
    if (!backupId) {
      spinner.text = 'Finding latest backup...';
      const { connections } = await getConnections();

      if (connections.length === 0) {
        spinner.fail('No Okta connections found');
        return;
      }

      const { backups } = await getBackups(connections[0].id);

      if (backups.length === 0) {
        spinner.fail('No backups found');
        return;
      }

      backupId = backups[0].id;
    }

    spinner.stop();

    // Interactive provider selection
    const { provider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select Git provider:',
        choices: [
          { name: 'GitHub', value: 'github' },
          { name: 'GitLab', value: 'gitlab' },
          { name: 'Bitbucket', value: 'bitbucket' },
          { name: 'Azure DevOps', value: 'azure-devops' },
        ],
      },
    ]);

    const { repository } = await inquirer.prompt([
      {
        type: 'input',
        name: 'repository',
        message: 'Repository (owner/repo):',
        validate: (input: string) => {
          if (!input.includes('/')) {
            return 'Please enter in format: owner/repo';
          }
          return true;
        },
      },
    ]);

    const { branch } = await inquirer.prompt([
      {
        type: 'input',
        name: 'branch',
        message: 'Branch name:',
        default: 'okta-backup',
      },
    ]);

    const { commitMessage } = await inquirer.prompt([
      {
        type: 'input',
        name: 'commitMessage',
        message: 'Commit message:',
        default: `Okta backup export - ${new Date().toISOString().split('T')[0]}`,
      },
    ]);

    spinner.start(`Exporting to ${provider}...`);

    const result = await exportToGit(backupId, {
      provider,
      repository,
      branch,
      commitMessage,
    });

    spinner.stop();

    console.log();
    printSuccess('Successfully exported to Git!');
    console.log();
    console.log(`  ${colors.muted('Repository:')} ${chalk.cyan(repository)}`);
    console.log(`  ${colors.muted('Branch:')} ${chalk.cyan(branch)}`);
    console.log(`  ${colors.muted('Commit:')} ${chalk.cyan(result.commitSha?.slice(0, 7) || 'N/A')}`);
    if (result.url) {
      console.log(`  ${colors.muted('URL:')} ${chalk.cyan(result.url)}`);
    }
  } catch (error) {
    spinner.fail('Git export failed');
    printError(error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
