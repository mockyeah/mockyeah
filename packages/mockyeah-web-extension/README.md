# @mockyeah/web-extension

**A powerful HTTP mocking browser extension for Chrome.**

<img src="https://raw.githubusercontent.com/mockyeah/mockyeah/master/packages/mockyeah-docs/src/images/logo/mockyeah-600.png" height="200" />

---

Here's a demo GIF (wait for it to load):

![demo](docs/demo.gif)

---

## Install

### Pre-packaged

1. Download [the `.crx` file](mockyeah.crx?raw=true).

2. In Chrome, go to `Settings` (the `⋮` icon in top-right corner) > `More Tools` > `Extensions`

3. Drag & drop the `.crx` extension file onto the Extensions page.

### Development

1. Clone the repo, navigate to it, and run `npm install && npm build:ci`.

2. `cd packages/mockyeah-web-extension && npm run build`

3. In Chrome, go to `Settings` (`⋮` icon in upper right corner) > `More Tools` > `Extensions`.

4. Make sure `Developer mode` is enabled via the toggle at the top of the page.

5. Click `Load unpacked` in the upper left and navigate to select the `mockyeah-web-extension` folder.

---

More at **https://mockyeah.js.org**.

## License

@mockyeah/web-extension is released under the [MIT License](https://opensource.org/licenses/MIT).
