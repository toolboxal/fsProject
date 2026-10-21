/**
 * Expo SDK 54 still requires Simulator.app. Xcode 27 replaced it with
 * Device Hub, so `expo run:ios` dies before it can target a physical phone.
 * Re-apply after `bun install` until we upgrade Expo CLI.
 */
const fs = require('fs')
const path = require('path')

const target = path.join(
  __dirname,
  '../node_modules/@expo/cli/build/src/start/doctor/apple/SimulatorAppPrerequisite.js',
)

if (!fs.existsSync(target)) {
  process.exit(0)
}

let source = fs.readFileSync(target, 'utf8')
if (source.includes('Xcode 27 replaced Simulator.app with Device Hub')) {
  process.exit(0)
}

const needle = `    async assertImplementation() {
        const result = await getSimulatorAppIdAsync();
        if (!result) {
            // This error may occur in CI where the users intends to install just the simulators but no Xcode.
            throw new _Prerequisite.PrerequisiteCommandError('SIMULATOR_APP', "Can't determine id of Simulator app; the Simulator is most likely not installed on this machine. Run \`sudo xcode-select -s /Applications/Xcode.app\`");
        }
        if (result !== 'com.apple.iphonesimulator' && result !== 'com.apple.CoreSimulator.SimulatorTrampoline') {
            throw new _Prerequisite.PrerequisiteCommandError('SIMULATOR_APP', "Simulator is installed but is identified as '" + result + "'; don't know what that is.");
        }
        debug(\`Simulator app id: \${result}\`);
        try {
            // make sure we can run simctl
            await (0, _spawnasync().default)('xcrun', [
                'simctl',
                'help'
            ]);
        } catch (error) {
            _log.warn(\`Unable to run simctl:\\n\${error.toString()}\`);
            throw new _Prerequisite.PrerequisiteCommandError('SIMCTL', 'xcrun is not configured correctly. Ensure \`sudo xcode-select --reset\` works before running this command again.');
        }
    }`

const replacement = `    async assertImplementation() {
        const result = await getSimulatorAppIdAsync();
        try {
            // make sure we can run simctl
            await (0, _spawnasync().default)('xcrun', [
                'simctl',
                'help'
            ]);
        } catch (error) {
            _log.warn(\`Unable to run simctl:\\n\${error.toString()}\`);
            throw new _Prerequisite.PrerequisiteCommandError('SIMCTL', 'xcrun is not configured correctly. Ensure \`sudo xcode-select --reset\` works before running this command again.');
        }
        if (!result) {
            // Xcode 27 replaced Simulator.app with Device Hub. simctl still works, so
            // skip the LaunchServices lookup that SDK 54's CLI requires.
            debug('Simulator.app not found; continuing because xcrun simctl is available (Xcode 27 Device Hub)');
            return;
        }
        if (result !== 'com.apple.iphonesimulator' && result !== 'com.apple.CoreSimulator.SimulatorTrampoline' && result !== 'com.apple.dt.Devices') {
            throw new _Prerequisite.PrerequisiteCommandError('SIMULATOR_APP', "Simulator is installed but is identified as '" + result + "'; don't know what that is.");
        }
        debug(\`Simulator app id: \${result}\`);
    }`

if (!source.includes(needle)) {
  console.warn(
    'scripts/patch-xcode27-simulator.js: @expo/cli source did not match; skip patch',
  )
  process.exit(0)
}

fs.writeFileSync(target, source.replace(needle, replacement))
console.log('Applied Xcode 27 Simulator.app workaround to @expo/cli')
