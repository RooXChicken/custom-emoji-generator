const errorColor = "rgb(255, 32, 32)";
const borderColor = "rgb(255, 117, 209)";

const packFormat = 46;
const fontPath = "assets/minecraft/font";
const imagePath = "assets/minecraft/textures";

const imagesDiv = document.getElementById("images");
const imageDetails = document.getElementById("imageDetails");
const generatePackButton = document.getElementById("generatePack");

const packName = document.getElementById("resourcePackName");
const packDescription = document.getElementById("resourcePackDescription");
const packPNG = document.getElementById("packPNG");

const startingUnicode = document.getElementById("startingUnicode");
const copyUnicodeLabel = document.getElementById("copyUnicodeLabel");
var unicodeStart = 0xE000;

const imagePreview = document.getElementById("imagePreview");
const imageUploader = document.getElementById("imageUploader");

const heightInput = document.getElementById("heightInput");
const scaleInput = document.getElementById("scaleInput");

var images = [ ];
var selectedIcon = null;
var selectedIconIndex = -1;

function onLoad() {
    packName.value = "pack";
    packDescription.value = "";

    copyUnicodeLabel.style.cursor = "not-allowed";
    startingUnicode.value = "\\uE000";
    startingUnicode.onkeyup = () => {
        if(!ensureValidUnicode()) {
            startingUnicode.style.borderColor = errorColor
        }
        else {
            startingUnicode.style.borderColor = borderColor;
        }
    };

    setImageSettings("", "", true);

    heightInput.onkeyup = () => { handleImageSetting(heightInput, 0); }
    scaleInput.onkeyup = () => { handleImageSetting(scaleInput, 1); }

    imageUploader.value = null;
    imageUploader.files = null;
    imagesDiv.style.display = "none";
    generatePackButton.disabled = true;

    images = [ ];
}

function ensureValidUnicode() {
    if(startingUnicode.value.match("\\u") == null) {
        return false;
    }

    let _unicode = Number.parseInt(startingUnicode.value.substring(2), 16);
    if(_unicode >= 1114112 || _unicode < 1024) { // unicode max
        return false;    
    }
        
    unicodeStart = _unicode;
    return true;
}

function handleImageSetting(_input, _index) {
    if(selectedIconIndex == -1) {
        return;
    }

    // finds any non number characters
    if(_input.value.match("[^0-9]") != null) {
        _input.style.borderColor = errorColor;
        return;
    }
    else {
        _input.style.borderColor = borderColor;
    }

    images[selectedIconIndex][2][_index] = 
        _input.value.length == 0 ? 0 : _input.value;

    refreshImage(selectedIcon, selectedIconIndex);
}

function copyUnicode() {
    if(selectedIconIndex == -1) {
        return;
    }

    navigator.clipboard.writeText(String.fromCodePoint(unicodeStart + selectedIconIndex));
}

function loadImages() {
    // clear previous images
    images = [ ];
    setImageSettings("", "", true);

    while(imagePreview.childNodes.length > 0) {
        imagePreview.removeChild(imagePreview.childNodes[0]);
    }

    for(let i = 0; i < imageUploader.files.length; i++) {
        let _file = imageUploader.files[i];
        let _reader = new FileReader();
    
        _reader.addEventListener("load", async function() {
            images[i] = [ _file.name.split(".")[0].toLowerCase(), arrayBufferToBase64(this.result), [ 0, 16 ] ];

            let _imageStr = "data:image/png;base64," + images[i][1];
            createIcon(_imageStr, i);
        });
        
        _reader.readAsArrayBuffer(_file);
    }

    generatePackButton.disabled = false;    
    imageDetails.style.display = "flex";
    imagesDiv.style.display = "flex";
}

// refreshes the image's tooltip
function refreshImage(_image, _index) {
    _image.parentElement.childNodes[0].innerText = 
        `Name: ${images[_index][0]}.png\nHeight: ${images[_index][2][0]}\nSize: ${images[_index][2][1]}`;
}

// creates an icon in the images section
function createIcon(_src, _index) {
    let _icon = document.createElement("div");
    _icon.classList.add("iconContainer");

    let _label = document.createElement("p");
    _label.classList.add("iconLabel");

    let _image = document.createElement("img");
    _image.classList.add("icon");
    _image.src = _src;
    _image.alt = "Icon " + images[_index][0];

    _image.onmouseenter = (_event) => {
        _label.style.display = "block";
    };

    _image.onmouseleave = (_event) => {
        _label.style.display = "none";
    };

    _image.onclick = (_event) => {
        let _isSelected = selectedIcon == _image;

        if(selectedIcon != null) {
            selectedIcon.style.transform = null;
        }

        // remove old icon
        selectedIcon = null;
        selectedIconIndex = -1;
        copyUnicodeLabel.style.cursor = "not-allowed";
        setImageSettings("", "", true);

        // only set new icon if it wasn't the old one
        if(!_isSelected) {
            selectedIcon = _image;
            selectedIconIndex = _index;
            
            copyUnicodeLabel.style.cursor = "pointer";
            selectedIcon.style.transform = "scale(1.3)";
            setImageSettings(images[_index][2][0], images[_index][2][1], false);
        }
        // navigator.clipboard.writeText(String.fromCodePoint(unicodeStart + _index));
    };

    
    _icon.appendChild(_label);
    _icon.appendChild(_image);
    
    imagePreview.appendChild(_icon);

    _image.onload = () => {
        images[_index][2][0] = Math.floor(_image.naturalHeight/1.5);
        images[_index][2][1] = _image.naturalHeight;
        refreshImage(_image, _index);
    };
}

function uploadPackPNG() {
    // create an input and 'click' it
    let _picker = document.createElement("input");
    _picker.type = "file";
    _picker.accept = "image/png";
    
    _picker.onchange = (_event) => {
        let _reader = new FileReader();
        _reader.readAsDataURL(_event.target.files[0]);
        
        _reader.onload = (_event) => {
            packPNG.src = _event.target.result;
        }
    };
    
    _picker.click();
}

// sets the image setting input labels to specified inputs
function setImageSettings(_height, _scale, _disabled) {
    heightInput.value = _height;
    scaleInput.value = _scale;

    heightInput.disabled = _disabled;
    scaleInput.disabled = _disabled;

    if(_disabled) {
        heightInput.style.borderColor = errorColor;
        scaleInput.style.borderColor = errorColor;
    }
    else {
        heightInput.style.borderColor = borderColor;
        scaleInput.style.borderColor = borderColor;
    }
}

async function generatePack() {
    let _msg = `{"providers": [`;
    let _name = (packName.value.length != 0) ? 
        packName.value : 
        "pack";

    let _description = (packDescription.value.length != 0) ? 
        packDescription.value : 
        "custom emoji generator [by roo]";
    
    // create our zip file
    let _zip = new JSZip();

    // process images
    for(let i = 0; i < images.length; i++) {
        _msg += writeBitmap((unicodeStart + i).toString(16).toUpperCase(), images[i][0], images[i][2][0], images[i][2][1], _name);
        _zip.file(`${imagePath}/${_name}/${images[i][0]}.png`, images[i][1], { base64: true });
    }

    // remove trailing json data
    _msg = _msg.substring(0, _msg.length - 2) + "]}";
    _zip.file(`${fontPath}/default.json`, _msg);

    // add details
    if(packPNG.src.match("data:image/png") != null) {
        let _packPNG = packPNG.src.substring(22); // trim extra data
        _zip.file("pack.png", _packPNG, { base64: true });
    }

    _zip.file("pack.mcmeta", `{"pack": { "pack_format": ${packFormat}, "description": "${_description}" } }`);
    _zip.file("credits.txt", "made by roo\nhttps://loveroo.org/");

    // generate blob and download file
    _zip.generateAsync({ type:"blob" }).then((_blob) => {
        let _url = window.URL.createObjectURL(_blob);
    
        let _link = document.createElement('a');
        _link.style.setProperty('display', 'none');
        _link.setAttribute("download", _name + ".zip");
        _link.href = _url;
    
        document.body.appendChild(_link);
    
        _link.click();
        window.URL.revokeObjectURL(_url);
    });
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
