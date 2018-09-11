var gm = require('gm').subClass({ imageMagick: true })
var fs = require('fs')

function hex2rgba (hex) {
  if (typeof hex !== 'string') {
    throw new Error('Color should be defined as hex string')
  }

  var hexCode = hex.slice().replace('#', '').split('')
  if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
    throw new Error('Invalid hex color: ' + hex)
  }

  // Convert from short to long form (fff -> ffffff)
  if (hexCode.length === 3 || hexCode.length === 4) {
    hexCode = Array.prototype.concat.apply([], hexCode.map(function (c) {
      return [c, c]
    }))
  }

  // Add default alpha value
  if (hexCode.length === 6) hexCode.push('F', 'F')

  var hexValue = parseInt(hexCode.join(''), 16)

  return {
    r: (hexValue >> 24) & 255,
    g: (hexValue >> 16) & 255,
    b: (hexValue >> 8) & 255,
    a: hexValue & 255,
    hex: '#' + hexCode.slice(0, 6).join('')
  }
}

exports.getOptions = function getOptions (options) {
  if (!options) options = {}
  if (!options.color) options.color = {}

  var margin = typeof options.margin === 'undefined' ||
    options.margin === null ||
    options.margin < 0 ? 4 : options.margin

  var width = options.width && options.width >= 21 ? options.width : undefined
  var scale = options.scale || 4

  return {
    width: width,
    scale: width ? 4 : scale,
    margin: margin,
    color: {
      dark: hex2rgba(options.color.dark || '#000000ff'),
      light: hex2rgba(options.color.light || '#ffffffff')
    },
    type: options.type,
    rendererOpts: options.rendererOpts || {}
  }
}

exports.getScale = function getScale (qrSize, opts) {
  return opts.width && opts.width >= qrSize + opts.margin * 2
    ? opts.width / (qrSize + opts.margin * 2)
    : opts.scale
}

exports.getImageWidth = function getImageWidth (qrSize, opts) {
  var scale = exports.getScale(qrSize, opts)
  return Math.floor((qrSize + opts.margin * 2) * scale)
}

exports.qrToImageData = function qrToImageData(qr, opts) {
  var type = opts.type

  if (type === 'dotted') return exports.drawDottedQrcode(qr, opts)

  // exports.drawGeneralQrcode(qr, opts)
}

exports.drawDottedQrcode = function (qr, opts){
  var size = qr.modules.size
  var data = qr.modules.data
  var scale = exports.getScale(size, opts)
  var qrSize = Math.floor((size + opts.margin * 2) * scale)
  var scaledMargin = opts.margin * scale
  var palette = [opts.color.light, opts.color.dark]
  var radius = 0.5 * scale

  var gmStream = gm(qrSize, qrSize, palette[0].hex)

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      var circleCenter = [scaledMargin + i * scale + radius, scaledMargin + j * scale + radius]
      var rectCorner = [
        scaledMargin + i * scale,
        scaledMargin + j * scale,
        scaledMargin + i * scale + 2 * radius,
        scaledMargin + j * scale + 2 * radius
      ]
      if (data[i * size + j]){
        gmStream
          .fill(palette[1].hex)
          // .drawCircle(circleCenter[0], circleCenter[1], circleCenter[0] + radius, circleCenter[1])
          .drawRectangle(rectCorner[0], rectCorner[1], rectCorner[2], rectCorner[3], scale)
      }
    }
  }


  return gmStream
  // gm(size, size, '#000')
  // .toBuffer('JPEG', function(err, buffer){
  //   if(err) throw Error(err)

  //   imgData = buffer
  // })

  // gm(pngImage)
  // .background('#000')
  // .stream()
  // .pipe(pngImage)

}


exports.drawGeneralQrcode = function (qr, opts){
  var pngOpts = opts.rendererOpts
  var qrSize = exports.getImageWidth(qrData.modules.size, opts)

  pngOpts.width = qrSize
  pngOpts.height = qrSize

  var pngImage = new PNG(pngOpts)

  var size = qr.modules.size
  var data = qr.modules.data
  var scale = exports.getScale(size, opts)
  var scaledMargin = opts.margin * scale
  var palette = [opts.color.light, opts.color.dark]

  for (var i = 0; i < qrSize; i++) {
    for (var j = 0; j < qrSize; j++) {
      var posDst = (i * qrSize + j) * 4
      var pxColor = opts.color.light

      if (i >= scaledMargin && j >= scaledMargin &&
        i < qrSize - scaledMargin && j < qrSize - scaledMargin) {
        var iSrc = Math.floor((i - scaledMargin) / scale)
        var jSrc = Math.floor((j - scaledMargin) / scale)
        pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0]
      }

      pngImage.data[posDst++] = pxColor.r
      pngImage.data[posDst++] = pxColor.g
      pngImage.data[posDst++] = pxColor.b
      pngImage.data[posDst] = pxColor.a
    }
  }
}