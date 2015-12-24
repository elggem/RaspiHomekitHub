var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

var i2c = require('i2c-bus');
var MPU6050 = require('i2c-mpu6050');

var address = 0x68;
var i2c1 = i2c.openSync(1);

var sensor = new MPU6050(i2c1, address);

var data = sensor.readSync().rotation.x;
console.log(data);

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var tilt_sensor = new Accessory('Is Tilted', uuid.generate('hap-nodejs:accessories:tilt-sensor'));
var shock_sensor = new Accessory('Was Shocked', uuid.generate('hap-nodejs:accessories:shock-sensor'));

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
tilt_sensor
  .addService(Service.MotionSensor)
  .getCharacteristic(Characteristic.MotionDetected)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, sensor.readSync().x<50);
  });

shock_sensor
  .addService(Service.MotionSensor)
  .getCharacteristic(Characteristic.MotionDetected)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, sensor.readSync().y>5);
  });

// randomize our temperature reading every 3 seconds
setInterval(function() {
  // update the characteristic value so interested iOS devices can get notified
  tilt_sensor
    .getService(Service.MotionSensor)
    .setCharacteristic(Characteristic.MotionDetected, sensor.readSync().rotation.x<50);
  
}, 1100);

// randomize our temperature reading every 3 seconds
setInterval(function() {
    // update the characteristic value so interested iOS devices can get notified
  shock_sensor
    .getService(Service.MotionSensor)
    .setCharacteristic(Characteristic.MotionDetected, sensor.readSync().rotation.y>5);
  
}, 850);


exports.accessories = [];
exports.accessories.push(tilt_sensor);
//exports.accessories.push(shock_sensor);

