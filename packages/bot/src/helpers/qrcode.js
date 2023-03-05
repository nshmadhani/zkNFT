var Jimp = require("jimp");
var QrCode = require('qrcode-reader');



// use with commonJS
const { MultiFormatReader, BarcodeFormat, DecodeHintType,
    RGBLuminanceSource, BinaryBitmap, HybridBinarizer } = require('@zxing/library');

const hints = new Map();
const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX/*, ...*/];

hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

const reader = new MultiFormatReader();

async function getProofStringFromQrCode(image) {
    return new Promise((resolve, reject) => {

        Jimp.read(image, function (err, image) {
            if (err) {
                reject(err);
                // TODO handle error
            }
            const luminanceSource =
                new RGBLuminanceSource(Uint8Array.from(image.bitmap.data),
                    image.bitmap.width, image.bitmap.height);
            const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
            reader.decode(binaryBitmap, hints);

        });
    })

}

module.exports = {
    getProofStringFromQrCode
}