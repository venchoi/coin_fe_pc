const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const base64 = {};
// private method for UTF-8 encoding
base64.utf8Encode = (inputStr) => {
  const string = String(inputStr).replace(/\r\n/g, '\n');
  let utftext = '';
  for (let n = 0; n < string.length; n += 1) {
    const c = string.charCodeAt(n);
    if (c < 128) {
      utftext += String.fromCharCode(c);
    } else if ((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    } else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }
  return utftext;
};

// private method for UTF-8 decoding
base64.utf8Decode = (utftext) => {
  let string = '';
  let i = 0;
  let c;
  let c2;
  let c3;
  while (i < utftext.length) {
    c = utftext.charCodeAt(i);
    if (c < 128) {
      string += String.fromCharCode(c);
      i += 1;
    } else if ((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i + 1);
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      c2 = utftext.charCodeAt(i + 1);
      c3 = utftext.charCodeAt(i + 2);
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }
  return string;
};
// public method for encoding
base64.encode = (inputStr) => {
  let output = '';
  let chr1;
  let chr2;
  let chr3;
  let enc1;
  let enc2;
  let enc3;
  let enc4;
  let i = 0;
  const input = base64.utf8Encode(inputStr);
  while (i < input.length) {
    chr1 = input.charCodeAt(i);
    i += 1;
    chr2 = input.charCodeAt(i);
    i += 1;
    chr3 = input.charCodeAt(i);
    i += 1;
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    if (isNaN(chr2)) {
      enc3 = 64;
      enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output = output +
      keyStr.charAt(enc1) + keyStr.charAt(enc2) +
      keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }
  return output;
};

// public method for decoding
base64.decode = (inputStr) => {
  let output = '';
  let chr1;
  let chr2;
  let chr3;
  let enc1;
  let enc2;
  let enc3;
  let enc4;
  let i = 0;
  const input = inputStr.replace(/[^A-Za-z0-9+/=]/g, '');
  while (i < input.length) {
    enc1 = keyStr.indexOf(input.charAt(i));
    i += 1;
    enc2 = keyStr.indexOf(input.charAt(i));
    i += 1;
    enc3 = keyStr.indexOf(input.charAt(i));
    i += 1;
    enc4 = keyStr.indexOf(input.charAt(i));
    i += 1;
    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;
    output += String.fromCharCode(chr1);
    if (enc3 !== 64) {
      output += String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output += String.fromCharCode(chr3);
    }
  }
  output = base64.utf8Decode(output);
  return output;
};
export default base64;
