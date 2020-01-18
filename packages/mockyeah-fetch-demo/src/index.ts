import Mockyeah from '@mockyeah/fetch';
import { Data } from './slideshow';

const mockyeah = new Mockyeah({
  noWebSocket: true,
  devTools: true
});

// @ts-ignore
window.__MOCKYEAH__ = mockyeah;

mockyeah.mock('/test', 'ok');
mockyeah.mock(/test/, { json: { yes: 1 } });

console.log('demo');

fetch('https://httpbin.org/status/200');

type DataOrError = Data & { error?: string };

const refetch = async () => {
  try {
    const resJson = await fetch('https://httpbin.org/json');
    const data = await resJson.json();

    console.log('JSON', data);

    return data;
  } catch (error) {
    return {
      error: true
    };
  }

  // const resHtml = await fetch('https://httpbin.org/html')
  // const html = await resHtml.text()
  //
  // console.log('HTML', html)
};

// @ts-ignore
window.refetch = refetch;

const content = document.createElement('div');

const getContentHTML = (data?: DataOrError) => {
  if (!data) return '';

  const { slideshow, error } = data;

  let mainContent;
  if (error) {
    mainContent = `<div>Error!</div>`;
  } else if (!slideshow) {
    mainContent = `<div>No slideshow</div>`;
  } else {
    mainContent = `
        <div>
            <h1>${slideshow.title}</h1>
            <div>author: ${slideshow.author}</div>
            <div>date: ${slideshow.date}</div>
        </div>`;
  }
  
  return `
    ${mainContent}
    <br />
    <hr />
    <br />
    <a href="https://github.com/mockyeah/mockyeah/tree/master/packages/mockyeah-fetch-demo">View source at GitHub</a>
    `;
};

const redraw = (data?: DataOrError) => {
  const contentHTML = getContentHTML(data);

  content.innerHTML = contentHTML;
};

const button = document.createElement('button');

button.innerText = 'refetch';

button.addEventListener('click', async () => {
  const data = await refetch();
  redraw(data);
});

const buttonMock = document.createElement('button');

buttonMock.innerText = 'mock';

buttonMock.addEventListener('click', async () => {
  mockyeah.mock('*', 'nice!');
});

const h1 = document.createElement('h1');
h1.innerText = '@mockyeah/fetch demo';

document.body.append(h1, button, buttonMock, content);

(async () => {
  const data = await refetch();
  redraw(data);
})();
