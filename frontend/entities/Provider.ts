export type Provider = {
  name: string;
  prettyName: string;
  iconUrl: string;
};

export function getProviderIcon(providers: Provider[], providerName: string): string {
  const provider = providers.find((p) => p.name === providerName);
  return provider?.iconUrl ?? "";
}

export function getProviderPrettyName(providers: Provider[], providerName: string): string {
  const provider = providers.find((p) => p.name === providerName);
  return provider?.prettyName ?? providerName;
}
