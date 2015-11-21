var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

var mpu6050 = require('mpu6050');
var mpu = new mpu6050();

mpu.initialize();

/*
if (mpu.testConnection()) {
  console.log(mpu.getMotion6());
}
mpu.setSleepEnabled(1)
*/

// here's a fake temperature sensor device that we'll expose to HomeKit
var FAKE_SENSOR = {
  motionDetected: false,
  getMotion: function() { 
    return FAKE_SENSOR.motionDetected;
  },
  randomize: function() {
    // randomize temperature to a value between 0 and 100
    FAKE_SENSOR.motionDetected = Math.round(Math.random());
  }
}


// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:motion-sensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Motion Sensor', sensorUUID);

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.MotionSensor)
  .getCharacteristic(Characteristic.MotionDetected)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, FAKE_SENSOR.getMotion());
  });

// randomize our temperature reading every 3 seconds
setInterval(function() {
  
  FAKE_SENSOR.randomize();
  
  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.MotionSensor)
    .setCharacteristic(Characteristic.MotionDetected, FAKE_SENSOR.motionDetected);
  
}, 3000);