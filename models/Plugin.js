/**
 * Created by nilsbergmann on 10.12.16.
 */
const thinky = require('thinky')();
const type = thinky.type;
const semver = require('semver');

/**
 * @description Database model for installed plugin
 * @author Noim <nilsbergmann@noim.io>
 */
const Plugin = thinky.createModel('Plugin', {
    id: type.string().required(),
    versions: type.array().default(function () {
        return [];
    }).schema(type.object().schema({
        version: type.string(), // Version of the installed plugin version
        source: type.string(), // The plugin install will run: npm i <source> --pr....
        ignoreVersion: type.boolean(), // If the Plugin PluginInstaller should ignore the version tag while installing. This is important for local testing
        local: type.boolean()
    }))
});

/**
 * @name Plugin database model
 * @description Database model for installed plugin
 * @author Noim <nilsbergmann@noim.io>
 */
module.exports = Plugin;