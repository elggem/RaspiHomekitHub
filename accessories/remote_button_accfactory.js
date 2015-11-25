var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var rpi433    = require('rpi-433');

rfSniffer = rpi433.sniffer(2, 500);

rfSniffer.on('codes', function (code) {
  console.log('Code received: '+code);

  //update button channel...
   //   button
   //   .getService(Service.MotionSensor)
   //   .setCharacteristic(Characteristic.MotionDetected, false);
});

var buttonDefinitions = [{name: "Button A", id: '1101110000'},
                         {name: "Button B", id: '1101101000'},
                         {name: "Button C", id: '1101100100'}];

exports.accessories = [];

buttonDefinitions.forEach(function(buttonInfo) {

  // Generate a consistent UUID for our light Accessory that will remain the same even when
  // restarting our server. We use the `uuid.generate` helper function to create a deterministic
  // UUID based on an arbitrary "namespace" and the word "light".
  var buttonUUID = uuid.generate('hap-nodejs:accessories:'+buttonInfo.name);

  // This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
  var button = new Accessory(buttonInfo.name, buttonUUID);

  button
  .addService(Service.MotionSensor)
  .getCharacteristic(Characteristic.MotionDetected)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, false);
  });

  exports.accessories.push(button);

});






