document.getElementById("temp").addEventListener("click", () => {
  browser.runtime.sendMessage({ choice: "temp" });
  window.close();
});

document.getElementById("perm").addEventListener("click", () => {
  browser.runtime.sendMessage({ choice: "perm" });
  window.close();
});
