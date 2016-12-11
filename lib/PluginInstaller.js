/**
 * Created by nilsbergmann on 10.12.16.
 */
const Plugin = require('../models/Plugin');
const thinky = require('thinky')();
const r = thinky.r;
const async = require('async');
const fs = require('fs-extra');
const pino = require('pino');
const path = require('path');
const spawn = require('child_process').spawn;
const pretty = pino.pretty();
pretty.pipe(process.stdout);
const log = pino({
    name: 'Plugin Installer',
    safe: true
}, pretty);

/**
 * @description Has no constructor
 * @class
 * @classdesc The Plugin Installation Class
 * @author Noim <nilsbergmann@noim.io>
 */
class Installer {

    /**
     * @description Install every plugin which is in the database
     * @param {finalCallback} callback
     * @author Noim <nilsbergmann@noim.io>
     */
    installAtStartup(callback) {
        Plugin.run().then((everyPlugin) => {
            async.each(everyPlugin, (plugin, callback1) => {
                async.each(plugin.versions, (version, versionCallback) => {
                    this.install(plugin.id, version.version, version.source, version.ignoreVersion, false, versionCallback);
                }, (err) => {
                    callback1(err);
                })
            }, (err) => {
                callback(err);
            });
        }).catch(callback);
    }

    /**
     * @description Install a plugin for DevelHome
     * @param {string} name - Plugin name
     * @param {string} version - Plugin version to install
     * @param {string} source - The npm install argument
     * @param {boolean} ignoreVersion - Should the version passed to npm ?
     * @param {boolean} local - Is this an local installed plugin or from npm
     * @param {finalCallback} callback
     * @author Noim <nilsbergmann@noim.io>
     */
    install(name, version, source, ignoreVersion, local, callback) {
        log.info(`Start installing ${name} v${version} from ${source}`);
        async.waterfall([
            (callback) => {
                // Load plugin information's
                log.info(`Loading plugin information's`);
                Plugin.get(name).then((plugin) => {
                    if (plugin) {
                        log.info(plugin, `Plugin loaded.`);
                        callback(null, plugin);
                    } else {
                        callback("Error");
                    }
                }).error(() => {
                    log.info(`Plugin ${name} isn't in the database. I try to insert it.`);
                    const insert = {
                        id: name
                    };
                    log.info(insert, `Inserting...`);
                    Plugin.save(insert).then((plugin) => {
                        log.info(`Success! Plugin loaded.`);
                        callback(null, plugin);
                    }).catch(callback);
                });
            },
            (plugin, callback) => {
                log.info(`Create directory's`);
                const dir = `./plugin/${name}/${version}`;
                const installPath = path.resolve(dir);
                log.info(`Install directory: ${installPath}`);
                fs.ensureDir(installPath, (err) => {
                    callback(err, plugin, installPath);
                });
            },
            (plugin, installPath, callback) => {
                log.info(`Start installing via npm...`);
                let args = `i --prefix ${installPath} ${source}`;
                if (!ignoreVersion) args = args + `@${version}`;
                const npm = spawn('npm', args.split(' '));
                let errors = [];
                npm.stderr.on('data', (data) => {
                    errors.push(data.toString());
                });
                npm.on('exit', (code) => {
                    log.info(`NPM finished with code ${code}`);
                    if (code == 0) {
                        callback(null, plugin, installPath);
                    } else {
                        for (let i = 0; i < errors.length; i++){
                            log.error(errors[i]);
                        }
                        callback(code);
                    }
                });
            },
            (plugin, installPath, callback) => {
                Plugin.get(name).then((pl) => {

                    const IndexOfVersionInPlugin = pl.versions.PluginVersionContains(`${version}`, "version");
                    console.log(IndexOfVersionInPlugin);
                    if (IndexOfVersionInPlugin != false) {
                        r.table(Plugin.getTableName()).get(name).update({
                            versions: r.row('versions').changeAt(IndexOfVersionInPlugin, {
                                version: version,
                                source: source,
                                local: local,
                                ignoreVersion: ignoreVersion
                            }).distinct()
                        }).run().then((result) => {
                            log.info(result);
                            callback(null, plugin, installPath);
                        }).error(callback);
                    } else {
                        r.table(Plugin.getTableName()).get(name).update({
                            versions: r.row('versions').append({
                                version: version,
                                source: source,
                                local: local,
                                ignoreVersion: ignoreVersion
                            }).distinct()
                        }).run().then((result) => {
                            log.info(result);
                            callback(null, plugin, installPath);
                        }).error(callback);
                    }
                }).catch(callback);
            },
            (plugin, installPath, callback) => {
                log.info(`Check plugin...`);
                try {
                    require(path.relative(__dirname, installPath + '/node_modules/' + name));
                    log.info("Everything seems to be ok.");
                    callback();
                } catch (e) {
                    callback(e);
                }
            }
        ], (err, result) => {
            if (err) {
                log.error(err);
                callback(err);
            } else {
                callback();
            }
        })
    }

    /**
     * @description This callback will be called after the process has finished
     * @callback finalCallback
     */
}

/**
 * @module PluginInstaller
 * @type {Installer}
 * @author Noim <nilsbergmann@noim.io>
 */
module.exports = Installer;

/**
 * @return {boolean|int}
 * @author Noim <nilsbergmann@noim.io>
 */
Array.prototype.PluginVersionContains = function (what, field) {
    for (let i = 0; i < this.length; i++) {
        const x = this[i][field];
        if (String(x) == String(what)) return i;
    }
    return false;
};

/**
 * @description Distinct a multiDimensional Array
 * @returns {Array}
 */
Array.prototype.multiDistinct = function () {
    let uniques = [];
    let itemsFound = {};
    for (let i = 0, l = this.length; i < l; i++) {
        let stringified = JSON.stringify(this[i]);
        if (itemsFound[stringified]) {
            continue;
        }
        uniques.push(this[i]);
        itemsFound[stringified] = true;
    }
    return uniques;
};