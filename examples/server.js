var QRCode = require('../lib')
var connect = require('express')

function testQRCode (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' })

  var lyrics = "在有生的瞬间能遇到你 竟花光所有运气"

  var options = {
    scale: 10,
    shape: 'dotted',
    shapeDegree: 10,
    eyesType : 'round'
  }

  QRCode.toDataURL(lyrics, options, function (err, url) {
    if (err) console.log('error: ' + err)
    res.end("<!DOCTYPE html/><html><head><title>node-qrcode</title></head><body><img src='" + url + "'/></body></html>")
  })
}

connect.createServer(testQRCode).listen(3030)
console.log('test server started on port 3030')
