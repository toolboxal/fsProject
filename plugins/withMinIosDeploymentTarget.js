const { withDangerousMod } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const MARKER = '# xcode27-min-ios-deployment'
const SNIPPET = `
    ${MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current.nil? || current.to_f < 16.0
          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
        end
      end
    end
`

module.exports = function withMinIosDeploymentTarget(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile')
      let contents = fs.readFileSync(podfilePath, 'utf8')
      if (contents.includes(MARKER)) {
        return cfg
      }

      const anchor = `    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => ccache_enabled?(podfile_properties),
    )`

      if (!contents.includes(anchor)) {
        throw new Error(
          'withMinIosDeploymentTarget: could not find react_native_post_install in Podfile',
        )
      }

      fs.writeFileSync(podfilePath, contents.replace(anchor, `${anchor}\n${SNIPPET}`))
      return cfg
    },
  ])
}
