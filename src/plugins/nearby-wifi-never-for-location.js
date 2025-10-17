const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withNearbyWifiNeverForLocation(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    manifest.manifest['uses-permission'] =
      manifest.manifest['uses-permission'] || [];
    const permissions = manifest.manifest['uses-permission'];

    const permission = 'android.permission.NEARBY_WIFI_DEVICES';
    const isPermExisting = permissions.find(
      (perm) => perm.$['android:name'] === permission,
    );

    if (isPermExisting) {
      isPermExisting.$['android:usesPermissionFlags'] = 'neverForLocation';
      return config;
    }

    permissions.push({
      $: {
        'android:name': permission,
        'android:usesPermissionFlags': 'neverForLocation',
      },
    });

    return config;
  });
};
