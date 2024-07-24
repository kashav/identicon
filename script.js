function getBoxElement(ix) {
  return document.querySelector(`.box[data-ix="${ix}"]`);
}

function handleBoxClick() {
  this.classList.toggle("on");
  this.classList.toggle("off");

  const mirror = getBoxElement(this.dataset.mirrorIx);

  if (mirror != this) {
    mirror.classList.toggle("on");
    mirror.classList.toggle("off");
  }
}

function makeBox(ix, mirrorIx, clazz) {
  const box = document.createElement("div");
  box.dataset.ix = ix;
  box.dataset.mirrorIx = mirrorIx;
  box.classList.add("box");
  box.classList.add(clazz);
  box.addEventListener("click", handleBoxClick.bind(box));
  return box;
}

function makeBoxes() {
  const boxes = [];

  for (let col = 2; col >= 0; --col) {
    for (let row = 0; row < 5; ++row) {
      const ix = row * 5 + col;
      const mirrorIx = row * 5 + (4 - col);

      const clazz = Math.random() > 0.5 ? "on" : "off";

      const box = makeBox(ix, mirrorIx, clazz);
      const mirror = ix == mirrorIx ? null : makeBox(mirrorIx, ix, clazz);

      boxes.push(box);
      if (mirror) boxes.push(mirror);
    }
  }

  boxes.sort((a, b) => a.dataset.ix - b.dataset.ix);

  const container = document.getElementById("container");

  for (let box of boxes) {
    container.appendChild(box);
  }
}

function getBitRepr() {
  let repr = "";

  for (let col = 2; col >= 0; --col) {
    for (let row = 0; row < 5; ++row) {
      const ix = row * 5 + col;
      const box = getBoxElement(ix);
      repr += box.classList.contains("on") ? "0" : "1";
    }
  }

  return repr;
}

function setAnchorWithId(id, href, innerText) {
  const anchor = document.getElementById(id);
  anchor.setAttribute("href", href);
  anchor.innerText = innerText;
}

async function handleAnchorClick() {
  try {
    const url = `https://api.github.com/user/${this.dataset.id}`;
    const resp = await fetch(url);
    const json = await resp.json();

    if (!json || !json.login) {
      throw new Error("failed to retrieve login from api");
    }

    const accountUrl = `github.com/${json.login}`;
    setAnchorWithId("account-url", "https://" + accountUrl, accountUrl);

    const pngHref = `https://github.com/identicons/${json.login}.png`;
    const pngInnerText = `identicon ${this.dataset.id}`;
    setAnchorWithId("png-url", pngHref, pngInnerText);

    const pngUrlWrapper = document.getElementById("png-url-wrapper");
    pngUrlWrapper.style.display = "inline";
  } catch (error) {
    console.error(error);
    alert(error);
  }
}

let worker;
function startWorker() {
  const output = document.getElementById("output");
  output.innerHTML = "";

  const button = document.querySelector("button");
  button.onclick = stopWorker;
  button.innerText = "Stop";

  if (worker) worker.terminate();

  worker = new Worker("worker.js");
  worker.addEventListener("message", (event) => {
    const id = event.data;
    const anchor = document.createElement("a");
    anchor.dataset.id = id;
    anchor.setAttribute("href", "javascript:void(0);");
    anchor.addEventListener("click", handleAnchorClick.bind(anchor));
    anchor.innerText = id;
    output.appendChild(anchor);
  });

  worker.postMessage(getBitRepr());
}

function stopWorker() {
  if (worker) worker.terminate();

  const button = document.querySelector("button");
  button.onclick = startWorker;
  button.innerText = "Go";
}

window.onload = function () {
  makeBoxes();
  document.querySelector("button").onclick = startWorker;
};
