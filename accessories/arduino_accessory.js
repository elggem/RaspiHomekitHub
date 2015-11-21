var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyUSB0", { baudrate: 9600 });

serialPort.on("open", function () {
  console.log('Connection to hub light established!');
  /*serialPort.on('data', function(data) {
    console.log('data received: ' + data);
  });*/
  setTimeout( HUB_LIGHT.updateLight, 800 );
});

// here's a fake hardware device that we'll expose to HomeKit
var HUB_LIGHT = {
  powerOn: true,
  brightness: 50, // percentage
  saturation: 0, // percentage
  hue: 0, // percentage
  
  setPowerOn: function(on) { 
    console.log("Turning the hub light %s!", on ? "on" : "off");
    HUB_LIGHT.powerOn = on;
    HUB_LIGHT.updateLight();
  },
  setBrightness: function(brightness) {
    console.log("Setting hub light brightness to %s", brightness);
    HUB_LIGHT.brightness = brightness;
    HUB_LIGHT.updateLight();
  },
  setSaturation: function(saturation) {
    console.log("Setting hub light saturation to %s", saturation);
    HUB_LIGHT.saturation = saturation;
    HUB_LIGHT.updateLight();
  },
  setHue: function(hue) {
    console.log("Setting hub light hue to %s", hue);
    HUB_LIGHT.hue = hue;
    HUB_LIGHT.updateLight();
  },
  identify: function() {
    serialPort.write("10\r");
    console.log("Hub light identify...");
  },
  updateLight: function() {
    var color = HSVtoRGB(HUB_LIGHT.hue/360, 
                HUB_LIGHT.saturation/100, 
                HUB_LIGHT.brightness/100);

    if (!HUB_LIGHT.powerOn) {
      color.r = 0; 
      color.g = 0; 
      color.b = 0;
    }

    var rgbString = color.r + " " + color.g + " " + color.b;

    console.log("Sending to hub light:", rgbString)
    serialPort.write("1 "+rgbString+"\r2 "+rgbString+"\r3 "+rgbString+"\r4 "+rgbString+"\r");
  }
}

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "light".
var lightUUID = uuid.generate('hap-nodejs:accessories:hublight');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var light = exports.accessory = new Accessory('Hub Light', lightUUID);

// set some basic properties (these values are arbitrary and setting them is optional)
light
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Ava")
  .setCharacteristic(Characteristic.Model, "0.0.1")
  .setCharacteristic(Characteristic.SerialNumber, "AV3284280");

// listen for the "identify" event for this Accessory
light.on('identify', function(paired, callback) {
  HUB_LIGHT.identify();
  callback(); // success
});

// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
light
  .addService(Service.Lightbulb, "Hub Light") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {
    callback(null, HUB_LIGHT.powerOn);
  })
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


/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
 * http://stackoverflow.com/a/17243070
*/
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}
