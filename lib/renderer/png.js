var Utils = require('./utils')

exports.render = function render (qrData, options) {
  var opts = Utils.getOptions(options)
  return Utils.qrToImageData(qrData, opts)
}

exports.renderToDataURL = function renderToDataURL (qrData, options, cb) {
  if (typeof cb === 'undefined') {
    cb = options
    options = undefined
  }

  var gmStream = exports.render(qrData, options)
  
  gmStream.toBuffer('PNG', function(err, buffer){
    if (err) return cb(err)
    let url = 'data:image/png;base64,' + new Buffer(buffer).toString('base64')
    cb(null, url)
    })
}

exports.renderToFile = function renderToFile (path, qrData, options, cb) {
  if (typeof cb === 'undefined') {
    cb = options
    options = undefined
  }

  return exports.render(qrData, options).write(path, function(err){
    if(err) return cb(err)
    cb(null)
  })
}

exports.renderToFileStream = function renderToFileStream (stream, qrData, options) {
  return exports.render(qrData, options).stream('png').pipe(stream)
}
