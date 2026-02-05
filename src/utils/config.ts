import Conf from 'conf';

interface SelectedBackup {
  id: string;
  orgName: string;
  timestamp: string;
  connectionId: string;
}

interface ButterflyConfig {
  apiKey?: string;
  apiUrl: string;
  defaultOrg?: string;
  selectedBackup?: SelectedBackup | null;
}

const config = new Conf<ButterflyConfig>({
  projectName: 'butterfly-cli',
  defaults: {
    apiUrl: 'https://butterflysecurity.org',
  },
});

export function getConfig<K extends keyof ButterflyConfig>(key: K): ButterflyConfig[K] {
  return config.get(key);
}

export function setConfig<K extends keyof ButterflyConfig>(key: K, value: ButterflyConfig[K]): void {
  config.set(key, value);
}

export function clearConfig(): void {
  config.clear();
}

export function getApiKey(): string | undefined {
  return config.get('apiKey');
}

export function setApiKey(key: string): void {
  config.set('apiKey', key);
}

export function getApiUrl(): string {
  return config.get('apiUrl');
}

export function setApiUrl(url: string): void {
  config.set('apiUrl', url);
}

export function getDefaultOrg(): string | undefined {
  return config.get('defaultOrg');
}

export function setDefaultOrg(org: string): void {
  config.set('defaultOrg', org);
}

export function isAuthenticated(): boolean {
  return !!config.get('apiKey');
}
