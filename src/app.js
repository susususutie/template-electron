let times = 0;
function updateDom(dom) {
  const oldTextContent = dom.target.textContent.replace(/\+\d/, "");
  times++;
  dom.target.textContent = oldTextContent + `+${times}`;
}

function main() {
  document
    .querySelector("button")
    .addEventListener("click", updateDom);
}

main();
