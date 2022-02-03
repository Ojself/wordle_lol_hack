const https = require("https");
const vm = require("vm");

const downloadToString = async (url) => {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      const data = [];
      res
        .on("data", (chunk) => data.push(chunk))
        .on("end", () => {
          let buffer = Buffer.concat(data);
          resolve(buffer.toString());
        });
    });
  });
};

const getAppPageUrl = (mainPageHtml) => {
  const re = /\<script src="(\/_next\/static\/chunks\/pages\/_app.*?.js)".*?>/;
  return mainPageHtml.match(re)[1];
};

const getWordList = (appPageHtml) => {
  const re = /JSON.parse\('(.*?)'\)/;
  return appPageHtml.match(re)[1];
};

const getIndexFunction = (appPageHtml) => {
  const re = /function\(\){var .=new Date\(.*?}/;
  return appPageHtml.match(re)[0];
};

const MAIN_URL = "https://www.wordle.lol";

const main = async () => {
  const mainPageHtml = await downloadToString(MAIN_URL);
  const appPageUrl = `${MAIN_URL}${getAppPageUrl(mainPageHtml)}`;
  const appPageHtml = await downloadToString(appPageUrl);
  const wordList = JSON.parse(getWordList(appPageHtml).replace(/\\/g, ""));
  const indexFunctionString = getIndexFunction(appPageHtml);
  const context = vm.createContext();
  const winnerIndex = vm.runInContext(`(${indexFunctionString})()`, context);
  console.log(wordList[winnerIndex]);
};

main();
