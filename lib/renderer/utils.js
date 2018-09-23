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

  var shapeDegree = null
  if(options.shape){
    if(options.shapeDegree){
      shapeDegree = (options.shapeDegree / (10 * 2)) * scale
    }else{
      shapeDegree = options.shape === 'dotted' ? scale / 2 : null
    }
  }

  return {
    width: width,
    scale: width ? 4 : scale,
    margin: margin,
    color: {
      dark: hex2rgba(options.color.dark || '#000000ff'),
      light: hex2rgba(options.color.light || '#ffffffff')
    },
    shape: options.shape,
    shapeDegree,
    eyesType: options.eyesType,
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
  var size = qr.modules.size
  var data = qr.modules.data
  var scale = exports.getScale(size, opts)
  var qrSize = Math.floor((size + opts.margin * 2) * scale)
  var scaledMargin = opts.margin * scale
  var palette = [opts.color.light, opts.color.dark]
  var radius = 0.5 * scale
  var shapeDegree = opts.shapeDegree
  var eyesType = opts.eyesType
  
  var gmStream = gm(qrSize, qrSize, palette[0].hex).fill(palette[1].hex)

  if(eyesType === 'round'){
    
  }

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {

      if (data[i * size + j]) {
        var rectCorner = [
          scaledMargin + i * scale,
          scaledMargin + j * scale,
          scaledMargin + i * scale + 2 * radius,
          scaledMargin + j * scale + 2 * radius
        ]

        if (shapeDegree) rectCorner.push(shapeDegree)
        // console.log(typeof rectCorner[0])
        gmStream
          .drawRectangle(...rectCorner)
      }

    }
  }

  // console.log(gmStream)
  return gmStream
}
