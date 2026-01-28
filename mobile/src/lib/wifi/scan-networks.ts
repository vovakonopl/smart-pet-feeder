import WifiManager from 'react-native-wifi-reborn';

const invalidSsidSet = new Set(['(hidden SSID)', '<unknown ssid>']);

// returns an array of ssids
export async function scanNetworks(): Promise<string[]> {
  const wifiEntries = await WifiManager.reScanAndLoadWifiList();

  // sometimes returns an error string
  if (!Array.isArray(wifiEntries)) return [];

  const ssids = wifiEntries
    .map((network) => network.SSID)
    .filter((ssid) => ssid.length > 0 && !invalidSsidSet.has(ssid));

  return Array.from(new Set(ssids)).sort();
}
