var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

var SerialPort = require("serialport").SerialPort

// serial connection
var serialPort = new SerialPort("/dev/ttyUSB0", { baudrate: 9600 });

/*


var turn_on = function() {
    serialPort.write("1 10 10 10\r", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
};

serialPort.on("open", function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
  });
  setTimeout( turn_on, 5000 );

});

*/

// here's a fake hardware device that we'll expose to HomeKit
var HUB_LIGHT = {
  powerOn: false,
  brightness: 100, // percentage
  saturation: 100, // percentage
  hue: 100, // percentage
  
  setPowerOn: function(on) { 
    console.log("Turning the hub light %s!", on ? "on" : "off");
    HUB_LIGHT.powerOn = on;
    if (on) {
          serialPort.write("1 10 10 10\r");

        } else {
              serialPort.write("1 0 0 0\r");

        }

    //add callbacks to serial library here...
  },
  setBrightness: function(brightness) {
    console.log("Setting hub light brightness to %s", brightness);
    HUB_LIGHT.brightness = brightness;
  },
  setSaturation: function(saturation) {
    console.log("Setting hub light saturation to %s", saturation);
    HUB_LIGHT.saturation = saturation;
  },
  setHue: function(hue) {
    console.log("Setting hub light hue to %s", hue);
    HUB_LIGHT.hue = hue;
  }
}

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "light".
var lightUUID = uuid.generate('hap-nodejs:accessories:hublight');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var light = exports.accessory = new Accessory('Hub Light', lightUUID);

// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
light
  .addService(Service.Lightbulb, "Hub Light") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    HUB_LIGHT.setPowerOn(value);
    callback(); // Our Light is synchronous - this value has been successfully set
  });

// also add a Characteristic for Brightness
light
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Brightness)
  .on('get', function(callback) {
    callback(null, HUB_LIGHT.brightness);
  })
  .on('set', function(value, callback) {
    HUB_LIGHT.setBrightness(value);
    callback();
  })

// also add a Characteristic for Saturation
light
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Saturation)
  .on('get', function(callback) {
    callback(null, HUB_LIGHT.saturation);
  })
  .on('set', function(value, callback) {
    HUB_LIGHT.setSaturation(value);
    callback();
  })

// also add a Characteristic for Hue
light
  .getService(Service.Lightbulb)
  .addCharacteristic(Characteristic.Hue)
  .on('get', function(callback) {
    callback(null, HUB_LIGHT.hue);
  })
  .on('set', function(value, callback) {
    HUB_LIGHT.setHue(value);
    callback();
  })

