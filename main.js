// thank you <3
// https://www.npmjs.com/package/jimp/v/1.6.0
// var Jimp = null;
// import("./modules/jimp.js").then((_jimp) => {
//     Jimp = _jimp.Jimp;
// });

// thank you <3
// https://gildas-lormeau.github.io/zip.js/
// var ZipJS = null;
// import("./modules/zipjs/zip.js").then((_zip) => {
//     ZipJS = _zip;
// });

// // thank you <3
// // https://stuk.github.io/jszip/
// var JSZip = null;
// import("./modules/jszip.js").then((_zip) => {
//     JSZip = _zip.JSZip;
// });

const fontPath = "assets/minecraft/font";
const imagePath = "assets/minecraft/textures";

const packName = document.getElementById("resourcePackName");
const packDescription = document.getElementById("resourcePackDescription");
var unicodeStart = 0xE000;

const imagePreview = document.getElementById("imagePreview");
const imageUploader = document.getElementById("imageUploader");
var images = [ ];

function onLoad() {
    packName.value = "pack";
    packDescription.value = "";

    imageUploader.value = null;
    imageUploader.files = null;
    images = [ ];
}

function loadImages() {
    // clear previous images
    images = [ ];
    while(imagePreview.childNodes.length > 0) {
        imagePreview.removeChild(imagePreview.childNodes[0]);
    }

    for(let i = 0; i < imageUploader.files.length; i++) {
        let _file = imageUploader.files[i];
        let _reader = new FileReader();
    
        _reader.addEventListener("load", async function() {
            images[i] = [ _file.name.split(".")[0].toLowerCase(), arrayBufferToBase64(this.result) ];

            let _imageStr = "data:image/png;base64," + images[i][1];
            createIcon(_imageStr, i);
        });
        
        _reader.readAsArrayBuffer(_file);
    }
}

function createIcon(_src, _index) {
    let _icon = document.createElement("div");
    _icon.classList.add("iconContainer");

    let _label = document.createElement("p");
    _label.classList.add("iconLabel");
    
    _label.innerText = 
        `Name: ${images[_index][0]}\nOffset: ${0}\nSize: ${16}}`;

    let _image = document.createElement("img");
    _image.classList.add("icon");
    _image.src = _src;

    _image.onmouseenter = (_event) => {
        _label.style.display = "block";
    };

    _image.onmouseleave = (_event) => {
        _label.style.display = "none";
    };

    _image.onclick = (_event) => {
        navigator.clipboard.writeText(String.fromCodePoint(0xE000 + _index));
    };

    _icon.appendChild(_label);
    _icon.appendChild(_image);

    imagePreview.appendChild(_icon);
}

async function generatePack() {
    let _msg = `{"providers": [`;let _name = (packName.value.length != 0) ? 
        packName.value : 
        "pack";

    let _description = (packDescription.value.length != 0) ? 
        packDescription.value : 
        "custom-emoji-generator [by roo]";

    let _toAdd = [ ];

    let _zip = new JSZip();

    // let _zipFile = new ZipJS.BlobWriter("application/zip");
    // let _zipWriter = new ZipJS.ZipWriter(_zipFile, { extendedTimestamp: false, compressionMethod: 8 });

    // _zipWriter.add("assets/");
    // _zipWriter.add("assets/minecraft/");
    // _zipWriter.add("assets/minecraft/font/");

    for(let i = 0; i < images.length; i++) {
        // let _img = await new ZipJS.Data64URIReader(images[i][1]);
        _msg += writeBitmap((unicodeStart + i).toString(16).toUpperCase(), images[i][0], 16, 16, _name);

        _toAdd[_toAdd.length] = [ `${imagePath}/${_name}/${images[i][0]}.png`, images[i][1] ];
    }

    _msg = _msg.substring(0, _msg.length - 2) + "]}";
    _zip.file(`${fontPath}/default.json`, _msg);
    // await _zipWriter.add(`${fontPath}/default.json`, new ZipJS.TextReader(_msg));

    // _zipWriter.add("assets/minecraft/textures/");
    // _zipWriter.add("assets/minecraft/textures/pack/");
    
    _toAdd.forEach(async function (_img) {
        _zip.file(_img[0], _img[1], { base64: true });
        // await _zipWriter.add(_img[0], _img[1]);
    });
    
    _zip.file("pack.mcmeta", `{"pack": { "pack_format": 46, "description": "${_description}" } }`);
    // await _zipWriter.add("pack.mcmeta", new ZipJS.TextReader(`{"pack": { "pack_format": 46, "description": "${_description}" } }`));
    // await _zipWriter.close();

    _zip.generateAsync({ type:"blob" }).then((_blob) => {
        let _url = window.URL.createObjectURL(_blob);
    
        let _link = document.createElement('a');
        _link.style.setProperty('display', 'none');
        _link.setAttribute("download", packName.value + ".zip");
        _link.href = _url;
    
        document.body.appendChild(_link);
    
        _link.click();
        window.URL.revokeObjectURL(_url);
    });

    // let _blob = await _zipFile.getData();
}

// create the glyph entry
function writeBitmap(_charName, _textureName, _ascent, _size, _name) {
    return `{"type": "bitmap", "file": "minecraft:${_name}/${_textureName}.png", "ascent": ${_ascent}, "height": ${_size}, "chars": ["\\u${_charName}"] }, `;
}

// converts a number to a unicode string (mainly just padded hex)
function unicodeFromIndex(_index) {
    let _padding = "";
    let _hex = _index.toString(16);
    
    // padding
    for(let _i = 0; _i < 3 - _hex.length; _i++) {
        _padding += "0";
    }

    return _padding + _hex.toUpperCase();
}

// thank you!!
// https://stackoverflow.com/a/9458996
function arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

function base64ToUint8Array(base64) {
    const binaryString = atob(base64);

    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
}
