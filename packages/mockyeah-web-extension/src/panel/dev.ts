import React from "react";

const whyRender = () => {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies, @typescript-eslint/no-var-requires
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    include: [/App/],
    logOnDifferentValues: true
  });
};

const createConsole = (appElement: HTMLElement) => {
  const consoleElement = document.createElement("ul");

  const clearConsoleElement = document.createElement("button");
  clearConsoleElement.innerText = "clear console";
  clearConsoleElement.addEventListener("click", () => {
    consoleElement.innerHTML = "";
  });

  appElement.insertAdjacentElement("afterend", consoleElement);
  appElement.insertAdjacentElement("afterend", clearConsoleElement);

  // eslint-disable-next-line global-require, import/no-extraneous-dependencies, @typescript-eslint/no-var-requires
  const ConsoleLogHTML = require("console-log-html");
  ConsoleLogHTML.connect(consoleElement);
};

export { whyRender, createConsole };
