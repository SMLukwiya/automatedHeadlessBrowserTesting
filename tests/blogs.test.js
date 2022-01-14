const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000')
})

afterEach(async () => {
  await page.close();
})

// describe is used to group tests that require the same or common initial steps to execute, describe runs in sync mode
describe('When logged in', () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating')
  });

  test('Can see blog create form', async () => {
    const label = await page.getContentsOf('form label');

    expect(label).toEqual('Blog Title')
  });

  // nested describe
  describe('And using invalid inputs', () => {
    beforeEach(async () => {
      // attempt to submit the form without input data
      await page.click('form button');
    })

    test('the form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    })
  })
})
