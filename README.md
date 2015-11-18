raspi-homekit-hub
=================

This repository hosts all files for my Raspberry Pi Homekit Hub. The hub contains 4 strands of WS2812b LEDs for colored light and controls 433Mhz power sockets.

Hardware
========

Documentation on this coming soon.

Raspberry Pi Code
=================

 * Download and install node.js:

```bash
   wget https://node-arm.herokuapp.com/node_archive_armhf.deb
   sudo dpkg -i node_archive_armhf.deb
```

 * Download dependency for mdns NodeJS package:

```bash
   sudo apt-get install libavahi-compat-libdnssd-dev
```


More information can be found at [node-arm](http://node-arm.herokuapp.com/).

HAP-NodeJS is a Node.js implementation of HomeKit Accessory Server. The Raspberry Pi code here is based on it.

Remember to run `npm install` before actually running the server.

You can use the following command to start the HAP Server:

```sh
node HomekitCore.js
```

The HAP-NodeJS library uses the [debug](https://github.com/visionmedia/debug) library for log output. You can print some or all logs by setting the `DEBUG` environment variable. For instance, to see all debug logs while running the server:

```sh
DEBUG=* node HomekitCore.js
```

Arduino Code
============

To avoid using a level converter and also to provide a nice animation during the boot phase of the Raspberry Pi an Arduino is used for controlling the WS2812B. The code running on it is essentially a serial interface for the LEDs and is based on Adafruits Neopixel library (install it before trying to compile the code).
