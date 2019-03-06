const moment = require('moment');
const setup = require('./starter-kit/setup');
const bookings = require('./config');
const ENOUGH_TIME = 1500;

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let result;
  let browser;
  try {
    console.log('Getting a browser instance...');
    browser = await setup.getBrowser();
    console.log('Got it!!');
    result = await exports.run(browser);
  } catch (err) {
    console.log(err);
    return err;
  }
  return result;
};


const login = (page) => async (user, pwd) => {
  console.log(`Attempting to log in ${user}....`);
  const LOGIN_PAGE = 'https://alumnos.salsabachata.es/login';
  const LOGIN_FORM = 'body > div.container > div > div > div > div.card-body > form'; // eslint-disable-line max-len
  const USER_INPUT = `${LOGIN_FORM} > div:nth-child(2) > input`;
  const PWD_INPUT = `${LOGIN_FORM} > div:nth-child(3) > input`;
  const LOGIN_BTN = `${LOGIN_FORM} > button`;
  await page.goto(LOGIN_PAGE,
    {waitUntil: ['domcontentloaded', 'networkidle0']});
  await page.type(USER_INPUT, user);
  await page.type(PWD_INPUT, pwd);
  await Promise.all([
    page.click(LOGIN_BTN),
    page.waitForNavigation({waitUntil: 'networkidle0'}),
  ]);
  console.log(`Logged in succeeded for ${user}!`);
};

const delay = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

const bookClass = (page) => async ({dance, level, centre, when, confirmButton}) => {
  const nextDate = moment().day(when).format('YYYY-MM-DD');
  const BOOKING_PAGE = `https://alumnos.salsabachata.es/extranet/realizar-reserva?centro=${centre}&tipo_curso=${dance}&nivel=${level}&dia=${nextDate}`;
  const BOOKING_BUTTON = 'body > div.container.my-2.my-sm-3 > div.row.no-gutters.border > div.col-8.col-sm > a';
  console.log(`Choosing dance ${dance} and level ${level}...`);
  await page.goto(BOOKING_PAGE,
    {waitUntil: ['domcontentloaded', 'networkidle0']});
  await page.click(BOOKING_BUTTON);
  await delay(ENOUGH_TIME);
  console.log(`Confirming class dance ${dance} and level ${level}...`);
  await page.click(confirmButton);
  await delay(ENOUGH_TIME);
};

exports.run = async (browser) => {
  console.log('Getting a new page...');
  const page = await browser.newPage();
  const runLogin = login(page);
  const runBookClass = bookClass(page);

  try {
    for (let i=0; i<bookings.length; i++) {
      const {user, pwd, classes} = bookings[i];
      await runLogin(user, pwd);
      for (let j=0; j<classes.length; j++) {
        await runBookClass(classes[j]);
      }
    }
  } catch (e) {
    console.error(e);
  }

  await page.close();
  return 'All booked!!';
};
