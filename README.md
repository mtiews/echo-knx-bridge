**WORK IN PROGRESS**

# echo-knx-bridge

**_Control your KNX Devices that support simple on/off and percentage values via Amazon Echo!_**

## Intro 

Nodejs based implementation simulating a Philips Hue Bridge which writes values (on/off/percentage) to KNX via KNXnet/IP.

This small weekend project was motivated by getting in touch with an Amazon Echo Dot - a small swag participants of the AWS re:Invent 2016 received. As there is no easy way to connect Echo to KNX I decided to implement a solution based on the Philips Hue Protocol, as Echo does support it natively.

Many thanks to the authors of the various nodejs based Hue implementations
and the nodejs knx module!!!

## Installation 

By default the Web Server starts at Port 8080. This can be changed in the `server.js`. The application is using Port 1900 for SSDP, which can not be changed, so ensure this Port is not used otherwise.


1. Clone the repository
2. Run `npm install`
3. Start the server using `node server.js`
4. Go to http://[yourhost]:[yourport]/configui/
5. Configure your KNX items
6. Save the Items
7. Let Amazon Echo discover your devices
8. Start controlling your KNX Devices via Voice

## Important hints

For controlling the KNX bus the nodejs library [knx](https://bitbucket.org/ekarak/knx.js#readme) is used.

I'm running an eibd deamon on a separate Raspberry connecting to the KNXnet/IP device, which is automatically discovered via this library. If you need to change the KNX connection settings, please have a look at the file `knx-adapter.js`.


