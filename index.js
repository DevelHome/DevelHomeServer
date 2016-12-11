/**
 * Created by nilsbergmann on 10.12.16.
 */
const installer = require('./lib/PluginInstaller');
const Installer = new installer();
function installTest() {
    Installer.install('async', 'latest', 'async', false, false, () => {Installer.install('async', '2.1.2', 'async', false, false, () => {});});
}
function installTest2() {
    Installer.install('chalk', 'latest', 'chalk', false, false, () => {});
}
function startUpTest() {
    Installer.installAtStartup(() => {});
}
installTest2();
//startUpTest();
//Installer.install('async', 'latest', 'async', false, false, () => {Installer.install('async', '2.1.2', 'async', false, false, () => {});});
//Installer.installAtStartup(() => {});