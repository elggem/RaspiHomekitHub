var fs = require('fs');
var path = require('path');
var storage = require('node-persist');
var uuid = require('./').uuid;
var Bridge = require('./').Bridge;
var Service = require('./').Service;
var Characteristic = require('./').Characteristic;
var Accessory = require('./').Accessory;
var accessoryLoader = require('./lib/AccessoryLoader');
var exec = require('child_process').exec;

console.log("HAP-NodeJS starting...");

// Initialize our storage system
storage.initSync();

// Start by creating our Bridge which will host all loaded Accessories
var bridge = new Bridge('Ava', uuid.generate("raspi-homekit-hub"));

// set some basic properties (these values are arbitrary and setting them is optional)
bridge
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Ava")
  .setCharacteristic(Characteristic.Model, "0.0.1")
  .setCharacteristic(Characteristic.SerialNumber, "AV3923970");

// Load up all accessories in the /accessories folder
var dir = path.join(__dirname, "accessories");
var accessories = accessoryLoader.loadDirectory(dir);

// Add them all to the bridge
accessories.forEach(function(accessory) {
  bridge.addBridgedAccessory(accessory);
});

// Listen for bridge identification event
bridge.on('identify', function(paired, callback) {
  console.log("Node Bridge identify- shutting down");
  //TODO: Maybe implement a blinking of the hub light here.
  accessories.forEach(function(accessory) {
    if (accessory.displayName == 'Hub Light') {
      accessory.shutdownLight();
    }
  });

  child = exec('shutdown -h now',
    function (error, stdout, stderr) {
      callback(); // success
  });
  
});

// Publish the Bridge on the local network.
bridge.publish({
  username: "CC:22:3D:E3:CE:F5",
  port: 51826,
  pincode: "031-45-154",
  category: Accessory.Categories.OTHER
});
