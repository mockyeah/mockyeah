chrome.devtools.panels.create(
  "Mockyeah",
  "icon-32.png",
  "panel.html",
  panel => {
    console.log("devtools panel", panel);
  }
);
