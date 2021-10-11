var webdriver = require("selenium-webdriver");
var chrome = require("selenium-webdriver/chrome");
const path = require("chromedriver").path;
let creds = require("./creds.json");
var options = new chrome.Options();
options.addArguments("--log-level=3");

const service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);
const LEFT = 0;
const RIGHT = 768;
async function login(id, orientation) {
  console.log("Logging in as ", creds[id].email);
  let driver_1 = new webdriver.Builder()
    .setChromeOptions(options)
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();
  driver_1.manage().window().setRect({
    width: 768,
    height: 800,
    x: orientation,
    y: 0,
  });
  await driver_1.get("http://localhost:8000/users/login");
  await driver_1
    .findElement(webdriver.By.name("email"))
    .sendKeys(creds[id].email);
  await driver_1
    .findElement(webdriver.By.name("password"))
    .sendKeys(creds[id].password);
  await driver_1.findElement(webdriver.By.id("login-button")).click();
  driver_1.wait(webdriver.until.titleIs("Saychess Play"), 5000);
  await driver_1.findElement(webdriver.By.id("playOnlineBtn")).click();
  driver_1.findElement(webdriver.By.id("playBtn")).click();
}

login("1", LEFT).catch((err) => {
  console.log(err);
});


login("2", RIGHT).catch((err) => {
  console.log(err);
});
