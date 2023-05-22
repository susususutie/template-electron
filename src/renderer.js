// 渲染器进程, 也就是运行在浏览器环境中的js文件
// 无法直接使用electron相关API, 除非在预加载文件(preload.js)中显式暴露
//
let times = 0;
function updateDom(dom) {
  const oldTextContent = dom.target.textContent.replace(/\+\d/, "");
  times++;
  dom.target.textContent = oldTextContent + `+${times}`;
}

function main() {
  document.querySelector(".count").addEventListener("click", updateDom);

  // 1. renderer --> main
  const btnSetTitle = document.querySelector(".set-title");
  btnSetTitle.addEventListener("click", (ev) => {
    window.electronAPI.sendSetTitle(`title from renderer ${Date.now()}`);
  });

  // 2. renderer <-> main
  const btnOpenFile = document.getElementById("open-file");
  const eleFilePath = document.getElementById("file-path");
  btnOpenFile.addEventListener("click", async () => {
    const filePath = await window.electronAPI.invokeOpenFile();
    eleFilePath.innerText = filePath;
  });

  // 3. main --> renderer
  const eleCounter = document.getElementById("counter");
  window.electronAPI.onUpdateCounter((event, value) => {
    const oldValue = parseInt(eleCounter.innerText);
    const newValue = oldValue + value;
    eleCounter.innerText = newValue;
    event.sender.send("counter-value", newValue);
  });
}

main();
