var assert = require('assert'),
  webdriver = require('selenium-webdriver'),
  conf_file = process.argv[3] || 'conf/single.conf.js';
  
var caps = require('../' + conf_file).capabilities;

var buildDriver = function(caps) {
  return new webdriver.Builder().
    usingServer('https://hub-cloud.browserstack.com/wd/hub').
    withCapabilities(caps).
    build();
};

describe('BrowserStack\'s Cart Functionality for ' + caps.browserName, function() {
  this.timeout(0);
  var driver;

  beforeEach(function(done) {
    driver = buildDriver(caps);
    done();
  });

  it('can add items to cart', async function (done) {
    await driver.get('https://bstackdemo.com/');
    await driver.wait(webdriver.until.titleMatches(/StackDemo/i), 10000);

    try {
      // locating product on webpage and getting name of the product
      let productText = await driver.findElement(webdriver.By.xpath('//*[@id="1"]/p')).getText();
      // clicking the 'Add to cart' button
      await driver.findElement(webdriver.By.xpath('//*[@id="1"]/div[4]')).click()
      // waiting until the Cart pane has been displayed on the webpage
      driver.findElement(webdriver.By.className('float-cart__content'))
      // locating product in cart and getting name of the product in cart
      let productCartText = await driver.findElement(webdriver.By.xpath('//*[@id="__next"]/div/div/div[2]/div[2]/div[2]/div/div[3]/p[1]')).getText()
      // checking whether product has been added to cart by comparing product name
      assert(productText === productCartText);

      //marking the test as Passed if product has been added to the cart
      await driver.executeScript(
        'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"passed","reason": "Product has been successfully added to the cart!"}}'
      );
    } catch (e) {
      //marking the test as Failed if product has not been added to the cart
      console.log("Error:", e.message)
      await driver.executeScript(
        'browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"failed","reason": "Some elements failed to load."}}'
      );
    } finally {
      await driver.quit();
    }
  });
});
