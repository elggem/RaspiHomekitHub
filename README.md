raspi-homekit-hub
=================

This repository hosts all files for my Raspberry Pi Homekit Hub. The hub contains 4 strands of WS2812b LEDs for colored light and controls 433Mhz power sockets.

HAP-NodeJS
==========

HAP-NodeJS is a Node.js implementation of HomeKit Accessory Server. The Raspberry Pi code and documentation here is based on it.

Remember to run `npm install` before actually running the server.

You can use the following command to start the HAP Server in Bridged mode:

```sh
node BridgedCore.js
```

The HAP-NodeJS library uses the [debug](https://github.com/visionmedia/debug) library for log output. You can print some or all logs by setting the `DEBUG` environment variable. For instance, to see all debug logs while running the server:

```sh
DEBUG=* node BridgedCore.js
```

Notes
=====

Schematics coming soon.