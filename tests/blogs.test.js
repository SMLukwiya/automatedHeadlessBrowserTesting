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

  describe('And using valid inputs', () => {
    // already logged in from above, -- enter input before any attempts
    beforeEach(async () => {
      await page.type('.title input', 'My Test Title');
      await page.type('.content input', 'My Test Content...');
      await page.click('form button');
    })

    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('h5');

      expect(text).toEqual('Please confirm your entries');
    })

    test('Submitting then saving adds blogs to index page', async () => {
      await page.click('button.green');
      await page.waitForSelector('.card');

      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(title).toEqual('My Test Title');
      expect(content).toEqual('My Test Content...');
    });
  })

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

describe('When not logged in', () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs'
    }, {
      method: 'post',
      path: '/api/blogs',
      data: {
        title: 'My Test Title',
        content: 'My Test Content'
      }
    }
  ]

  test('Blog related actions not allowed', async () => {
    const results = await page.execRequest(actions);

    for (let result of results) {
        expect(result).toEqual({error: 'You must log in!'})
    }
  })

})
