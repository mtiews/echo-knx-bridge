var ip = require('ip');
var ssdp = require("peer-ssdp");
var bodyParser = require('body-parser');
var peer = ssdp.createPeer();
var express = require('express');
var app = express();

var serverImpl = require('./server-impl.js');

var MY_IP=ip.address();

// Change Port here -->
    var PORT=8080;
// <--

// ############################################################################
// SSDP - Discovery Protocol implementation for Philips HUE
// ############################################################################

var ssdpRecoveryResponse = '<?xml version="1.0"?>\r\n\
<root xmlns="urn:schemas-upnp-org:device-1-0">\r\n\
    <specVersion>\r\n\
        <major>1</major>\r\n\
        <minor>0</minor>\r\n\
    </specVersion>\r\n\
    <URLBase>http://' + MY_IP + ':' + PORT +'/</URLBase>\r\n\
    <device>\r\n\
        <deviceType>urn:schemas-upnp-org:device:Basic:1</deviceType>\r\n\
        <friendlyName>Philips hue Bridge Router</friendlyName>\r\n\
        <manufacturer>Royal Philips Electronics</manufacturer>\r\n\
        <manufacturerURL>http://example.com</manufacturerURL>\r\n\
        <modelDescription>Philips hue Personal Wireless Lighting Bridge Router</modelDescription>\r\n\
        <modelName>Philips hue bridge 2012</modelName>\r\n\
        <modelNumber>929000226503</modelNumber>\r\n\
        <modelURL>http://www.meethue.com</modelURL>\r\n\
        <serialNumber>01189998819991197253</serialNumber>\r\n\
        <UDN>uuid:87ed8eda-e0f3-4727-9927-b7d1367f461a</UDN>\r\n\
        <serviceList>\r\n\
            <service>\r\n\
                <serviceType>(null)</serviceType>\r\n\
                <serviceId>(null)</serviceId>\r\n\
                <controlURL>(null)</controlURL>\r\n\
                <eventSubURL>(null)</eventSubURL>\r\n\
                <SCPDURL>(null)</SCPDURL>\r\n\
            </service>\r\n\
        </serviceList>\r\n\
        <presentationURL>index.html</presentationURL>\r\n\
        <iconList>\r\n\
            <icon>\r\n\
                <mimetype>image/png</mimetype>\r\n\
                <height>48</height>\r\n\
                <width>48</width>\r\n\
                <depth>24</depth>\r\n\
                <url>hue_logo_0.png</url>\r\n\
            </icon>\r\n\
            <icon>\r\n\
                <mimetype>image/png</mimetype>\r\n\
                <height>120</height>\r\n\
                <width>120</width>\r\n\
                <depth>24</depth>\r\n\
                <url>hue_logo_3.png</url>\r\n\
            </icon>\r\n\
        </iconList>\r\n\
    </device>\r\n\
</root>';

peer.on("ready",function(){
    console.log('SSDP: Ready');
});
 
peer.on("notify",function(headers, address){
    //console.log('SSDP: Notify');
});

peer.on("search",function(headers, address){
    console.log('SSDP: Search', headers, address);
    if (headers.ST && headers.MAN=='"ssdp:discover"') {
        peer.reply({
            NT: "urn:schemas-upnp-org:device:basic:1",
            SERVER: 'FreeRTOS/6.0.5, UPnP/1.0, IpBridge/0.1',
            ST: "urn:schemas-upnp-org:device:basic:1",
            USN: "uuid:Socket-1_0-221438K0100073::urn:Belkin:device:**",
            LOCATION: 'http://{{networkInterfaceAddress}}:' + PORT + '/description.xml',            
        }, address);
    }
});
 
peer.on("found",function(headers, address){
    //console.log('SSDP: Found');
});
 
peer.on("close",function(){
    //console.log('SSDP: Close');
}); 
peer.start();


// ############################################################################
// Philips Hue API Entrypoints
// ############################################################################

var expressLogger = function (req, res, next) {
    console.log('EXPRESS - REQUEST: ' + req.method + ' ' + req.originalUrl);
    console.log(req.headers);
    next();
};
app.use(expressLogger);

// ############################################################################
// Philips Hue API Entrypoints
// ############################################################################

app.use('/api', bodyParser.json({ type: '*/*' }));

// !!! Also part of the ssdp discovery protocol, so do not change!!!
app.get('/description.xml', function(req, res) {
    res.send(ssdpRecoveryResponse);
});

app.get('/api/:userid', function(req, res) {
    var lights = serverImpl.getAllItems();
    res.json(lights);
});

app.get('/api/:userid/lights', function(req, res) {
    var lights = serverImpl.getAllItems();
    res.json(lights);
});

app.get('/api/:userid/lights/:lightid', function(req,res) {
    var light = serverImpl.getItem(req.params.lightid);
    res.send(light);
});

app.put('/api/:userid/lights/:lightid/state', function(req,res) {
    console.log('EXPRESS - REQUEST BODY: ' + JSON.stringify(req.body));
    var data = req.body;
    var op = Object.keys(data)[0];
    var val = data[op];
    var id = req.params.lightid;

    if(!!op) {
        if(op == 'on') {
            serverImpl.setOnOff(id, val);
            var result = {};
            result['/lights/' + id + '/state/on'] = val;
            res.json([{success:result}]);
        }
        else if(op == 'bri') {
            serverImpl.setPercentage(id, val);
            var result = {};
            result['/lights/' + id + '/state/bri'] = val;
            res.json([{success:result}]);
        }
        else {
            console.log('EXPRESS: Errror: Invalid operation: ' + op);
            res.status(400).json({'error': 'Invalid operation: ' + op});    
        }
    }
    else {
        res.status(400).json({'error': 'Invalid request received'});
    }
});

// ############################################################################
// Config UI Entrypoints
// ############################################################################
app.use('/configui', express.static(__dirname + '/configui'));

app.use('/admin/adapter/config', bodyParser.json());

app.get('/admin/adapter/config', function(req,res) {
    var config = serverImpl.getAdapterConfig();
    res.json(config);
});

app.post('/admin/adapter/config', function(req,res) {
    console.log('EXPRESS - REQUEST BODY: ' + req.body);
    serverImpl.saveAdapterConfig(req.body);
    res.json({'status': 'ok'});
});

app.listen(PORT, function () {
    console.log('EXPRESS: Started @ ' + PORT);
});


