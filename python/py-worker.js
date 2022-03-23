// https://pyodide.org/en/stable/usage/webworker.html

const pyodideWorker = new Worker("./webworker.js");

const callbacks = {};

pyodideWorker.onmessage = (event) => {
  const { id, ...data } = event.data;
  const onSuccess = callbacks[id];
  delete callbacks[id];
  onSuccess(data);
};

const asyncRun = (() => {
  let id = 0;
  return (script, context) => {
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise((onSuccess) => {
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        ...context,
        python: script,
        id,
      });
    });
  };
})();

export { asyncRun };

// import { asyncRun } from "./py-worker.js";

// async function computeIds() {
//   const output = document.querySelector("#output");
//   output.innerText = "";

//   const script = `
//       import hashlib
//       from js import pattern

//       def nibble(digest):
//           for byte in digest[:8]:
//               hi, lo = byte & 0xF0, byte & 0x0F
//               yield hi >> 4
//               yield lo

//       def is_parity_match(c, v):
//           return c == "x" or v & 1 == int(c)

//       def md5_test(n, pattern):
//           b = bytes(str(n), "utf8")
//           h = hashlib.md5(b)
//           return all(is_parity_match(c, v) for v, c in zip(nibble(h.digest()), pattern))

//       [i for i in range(100_000_000) if md5_test(i, pattern)]
// `;

//   let { result, error } = await asyncRun(script, {
//     pattern: getBitRepr(),
//   });

//   if (error) {
//     console.error(error);
//   }

//   for (let result of results) {
//     output.innerText += result + "\n";
//   }
// }
