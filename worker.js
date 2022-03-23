self.importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/core.min.js"
);

self.importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/md5.min.js"
);

// adapted from https://stackoverflow.com/a/29433028
function* nibble({ words }) {
  for (let i = 0; i < 8; ++i) {
    let byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;

    let hi = byte & 0xf0;
    let lo = byte & 0x0f;

    yield hi >> 4;
    yield lo;
  }
}

function isParityMatch(nibble, lsb) {
  return !lsb || (nibble & 1) == Number(lsb);
}

self.addEventListener("message", function (e) {
  const pattern = e.data;

  for (let i = 0; i < 100_000_000; ++i) {
    let hash = CryptoJS.MD5(String(i));
    let nibbles = Array.from(nibble(hash));
    if (nibbles.every((n, j) => isParityMatch(n, pattern[j]))) {
      self.postMessage(i);
    }
  }
});
