var fs = require('fs')
var PNG = require('pngjs').PNG
var Utils = require('./utils')

exports.render = function render (qrData, options) {
  // console.log(options)
  var opts = Utils.getOptions(options)
  // var pngOpts = opts.rendererOpts
  // var size = Utils.getImageWidth(qrData.modules.size, opts)

  // pngOpts.width = size
  // pngOpts.height = size

  // var pngImage = new PNG(pngOpts)
  // Utils.qrToImageData(pngImage, qrData, opts)

  // return pngImage

  return Utils.qrToImageData(qrData, opts)
}

exports.renderToDataURL = function renderToDataURL (qrData, options, cb) {
  if (typeof cb === 'undefined') {
    cb = options
    options = undefined
  }

  // var png = exports.render(qrData, options)
  // var buffer = []

  // png.on('error', cb)

  // png.on('data', function (data) {
  //   buffer.push(data)
  // })

  // png.on('end', function () {
  //   var url = 'data:image/png;base64,'
  //   url += Buffer.concat(buffer).toString('base64')
  //   cb(null, url)
  // })

  // png.pack()

  var gmStream = exports.render(qrData, options)

  console.log(gmStream)
  
  gmStream.toBuffer('PNG', function(err, buffer){
    // console.log(buffer)
    let url = 'data:image/png;base64,' + new Buffer(buffer).toString('base64')
    cb(null, url)
    })
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
  // var png = exports.render(qrData, options)
  // png.pack().pipe(stream)

  return exports.render(qrData, options).stream('png').pipe(stream)
}
