importScripts("https://cdn.jsdelivr.net/pyodide/v0.19.1/full/pyodide.js");

async function loadPyodideAndPackages() {
  self.pyodide = await loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.19.1/full/",
  });
}
let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  await pyodideReadyPromise;

  const { id, python, ...context } = event.data;
  console.log(context);
  for (const key of Object.keys(context)) {
    self[key] = context[key];
  }

  try {
    await self.pyodide.loadPackagesFromImports(python);
    let results = await self.pyodide.runPythonAsync(python);
    self.postMessage({ results: results.toJs(), id });
  } catch (error) {
    self.postMessage({ error: error.message, id });
  }
};
