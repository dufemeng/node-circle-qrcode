var fs = require('fs')
var Utils = require('./utils')

exports.render = async function render (qrData, options) {
  var opts = Utils.getOptions(options)

  var pngImage = await Utils.qrToImageData(qrData, opts)

  return pngImage
}

exports.renderToDataURL = function renderToDataURL (qrData, options, cb) {
  if (typeof cb === 'undefined') {
    cb = options
    options = undefined
  }

  var png = exports.render(qrData, options)
  var buffer = []

  png.on('error', cb)

  png.on('data', function (data) {
    buffer.push(data)
  })

  png.on('end', function () {
    var url = 'data:image/png;base64,'
    url += Buffer.concat(buffer).toString('base64')
    cb(null, url)
  })

  png.pack()
}

exports.renderToFile = function renderToFile (path, qrData, options, cb) {
  if (typeof cb === 'undefined') {
    cb = options
    options = undefined
  }

  var stream = fs.createWriteStream(path)
  stream.on('error', cb)
  stream.on('close', cb)

  exports.renderToFileStream(stream, qrData, options)
}

exports.renderToFileStream = function renderToFileStream (stream, qrData, options) {
  var png = exports.render(qrData, options)
  png.pack().pipe(stream)
}
