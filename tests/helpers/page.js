/* This acts a place to write reusable and repetitive functions away from the real test files */
const puppeteer = require('puppeteer');

const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    // create proxy to have access to both customPage, page, and browser property
    return new Proxy(customPage, {
      get: function(target, property) {
        // order in which functions are returned determines order in which they are accessed
        return customPage[property] || browser[property] || page[property];
      }
    })
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    // create session to fake authenticate into the app
    const user = await userFactory();

    const {session, sig} = sessionFactory(user)

    await this.page.setCookie({name: 'session', value: session});
    await this.page.setCookie({name: 'session.sig', value: sig});

    // refresh the page to simulate login by causing entire app to rerender and navigate to blogs route;
    await this.page.goto('http://localhost:3000/blogs');
    // wait for the element so that the test doesn't fail
    await this.page.waitForSelector('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }
}

module.exports = CustomPage;
