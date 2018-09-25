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
  
  var gmStream = gm(qrSize, qrSize, palette[0].hex)

  if(eyesType === 'round'){
    drawQrcodeEyes(gmStream, size, scale, scaledMargin, palette, shapeDegree)
  }

  gmStream.fill(palette[1].hex).stroke('transparent')

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if(!(eyesType === 'round' && detactEyesRander(size, i, j))){
        if (data[i * size + j]) {
          var rectCorner = [
            scaledMargin + i * scale,
            scaledMargin + j * scale,
            scaledMargin + i * scale + 2 * radius,
            scaledMargin + j * scale + 2 * radius
          ]

          if (shapeDegree) rectCorner.push(shapeDegree)
          gmStream
            .drawRectangle(...rectCorner)
        }
      }
      
    }
  }

  return gmStream
}

function detactEyesRander(size, i, j){
  return !!(
    (i >= 0 && i <= 6 && j >=0 && j <= 6) ||
    (i >= (size - 7) && i <= (size - 1) && j >= 0 && j <= 6) ||
    (i >= 0 && i <= 6 && j >= (size - 7) && j <= (size - 1))
  )
}

function drawQrcodeEyes(gm, size, scale, scaledMargin, palette){
  var x0 = scaledMargin + 1, y0 = x0,
  x1 = scaledMargin + 1 + 6 * scale, y1 = x1,
  x2 = scaledMargin + (size - 6) * scale, y2 = y0,
  x3 = scaledMargin + size * scale, y3 = x1,
  x4 = x0, y4 = x2,
  x5 = x1, y5 = x3

  var offset = 1.5 * scale

  gm
    .fill(palette[0].hex)
    .stroke(palette[1].hex, scale/2)
    .drawRectangle(x0, y0, x1, y1, 7 * scale/2)
    .drawRectangle(x2, y2, x3, y3, 7 * scale/2)
    .drawRectangle(x4, y4, x5, y5, 7 * scale/2)
    .fill(palette[1].hex)
    .stroke('transparent')
    .drawRectangle(x0 + offset, y0 + offset, x1 - offset, y1 - offset, 4 * scale / 2)
    .drawRectangle(x2 + offset, y2 + offset, x3 - offset, y3 - offset, 4 * scale / 2)
    .drawRectangle(x4 + offset, y4 + offset, x5 - offset, y5 - offset, 4 * scale / 2)

  
  // var x0 = scaledMargin + 1 + 3 * scale, y0 = x0,
  //   x1 = scaledMargin + (size - 3) * scale, y1 = y0,
  //   x2 = x0, y2 = x1
  
  // var offset = 3 * scale

  // gm
  //   .fill(palette[0].hex)
  //   .stroke(palette[1].hex, scale / 2)
  //   .drawCircle(x0, y0, x0 + offset, y0)
  //   .drawCircle(x1, y1, x1 + offset, y1)
  //   .drawCircle(x2, y2, x2 + offset, y2)
}