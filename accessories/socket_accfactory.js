var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyUSB1", { baudrate: 9600 });

serialPort.on("open", function () {
  console.log('Connection to hub light established!');

});

var socketDefinitions = [{name: "Outlet A", id: 1},
                         {name: "Outlet B", id: 2},
                         {name: "Outlet C", id: 3}];

exports.accessories = [];

socketDefinitions.forEach(function(socketInfo) {

  // Generate a consistent UUID for our light Accessory that will remain the same even when
  // restarting our server. We use the `uuid.generate` helper function to create a deterministic
  // UUID based on an arbitrary "namespace" and the word "light".
  var socketUUID = uuid.generate('hap-nodejs:accessories:'+socketInfo.name);

  // This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
  var socket = new Accessory(socketInfo.name, socketUUID);

  // Init:
  socket.poweredOn = false;
  serialPort.write(10+socketInfo.id + " 0\r");

  // set some basic properties (these values are arbitrary and setting them is optional)
  socket
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, "Ava")
    .setCharacteristic(Characteristic.Model, "0.0.1")
    .setCharacteristic(Characteristic.SerialNumber, "AV323230");

  // listen for the "identify" event for this Accessory
  socket.on('identify', function(paired, callback) {
    console.log("Identify called on " + socketInfo.name);
    callback(); // success
  });

  // Add the actual Lightbulb Service and listen for change events from iOS.
  // We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
  socket
    .addService(Service.Outlet, socketInfo.name) // services exposed to the user should have "names" like "Fake Light" for us
    .getCharacteristic(Characteristic.On)
    .on('get', function(callback) {
      callback(null, socket.poweredOn);
    })
    .on('set', function(value, callback) {
      console.log("Switching " + socketInfo.name);

      if (value) {
        serialPort.write(10+socketInfo.id + " 1\r");
      } else {
        serialPort.write(10+socketInfo.id + " 0\r");
      }

      socket.poweredOn = value;
      callback(); // Our fake Light is synchronous - this value has been successfully set
    });

  exports.accessories.push(socket);

});






