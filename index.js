/**
 * Created by nilsbergmann on 10.12.16.
 */
const installer = require('./lib/PluginInstaller');
const PluginInstaller = new installer();
function installTest() {
    PluginInstaller.install('async', 'latest', 'async', false, false, () => {PluginInstaller.install('async', '2.1.2', 'async', false, false, () => {});});
}
function installTest2() {
    PluginInstaller.install('chalk', 'latest', 'chalk', false, false, () => {});
}
function startUpTest() {
    PluginInstaller.installAtStartup(() => {});
}
installTest2();
//startUpTest();
//PluginInstaller.install('async', 'latest', 'async', false, false, () => {PluginInstaller.install('async', '2.1.2', 'async', false, false, () => {});});
//PluginInstaller.installAtStartup(() => {});