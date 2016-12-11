/**
 * Created by nilsbergmann on 10.12.16.
 */
const thinky = require('thinky')();
const type = thinky.type;
const semver = require('semver');

/**
 * @description Database model for Devices
 * @author Noim <nilsbergmann@noim.io>
 */
const Device = thinky.createModel('Device', {
    possibleStates: type.array().schema(type.string()), // Regex Expressions or if the array length = 0, the server will accept anything
    notPossibleStates: type.array().schema(type.string()), // If you want to allow anything except a few things
    displayname: type.string().required().min(3), // Displayname of the Device
    value: type.string(), // Current value
    plugin: {
        name: type.string().required(), // Valid plugin name, the name is also the id of the plugin
        version: type.string().required().validator(semver.clean), // Version of the plugin
    },
    data: type.object() // Space for additional data
});

Device.ensureIndex('value');
Device.ensureIndex('displayname');

/**
 * @description Database model for Devices
 * @module Device
 * @author Noim <nilsbergmann@noim.io>
 */
module.exports = Device;
