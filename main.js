const _ = require("lodash");
const cheerio = require("cheerio");
const axios = require("axios").default;
const fs = require("fs");
const path = require("path");

const getSortedList = async topic => {
  const bookItems = [];
  const website = await axios.get(
    "https://www.goodreads.com/shelf/show/" + topic
  );
  const $ = cheerio.load(website.data);
  const leftContainer = $(".leftContainer")[0];
  const elements = $(leftContainer)
    .find(".elementList")
    .slice(0, 30);
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const bookTitle = $($(element).find(".bookTitle")[0]).text();
    const bookDetails = $($(element).find("span.greyText.smallText")[0])
      .text()
      .split("\n")
      .map(x => x.trim())
      .slice(1, 4);
    const bookRating = bookDetails[0].slice(11, 15);
    bookItems.push({
      title: bookTitle,
      rating: bookRating
    });
  }
  const sortedList = _.reverse(_.sortBy(bookItems, x => x.rating)).slice(0, 15);
  return sortedList;
};

const main = async () => {
  const topics = ["startup", "sales", "marketing"];
  topics.forEach(async topic => {
    let sortedList = await getSortedList(topic);
    let data =
      topic.toUpperCase() +
      "\n" +
      sortedList
        .map(x => {
          return `${x.title}\t${x.rating}`;
        })
        .join("\n");
    let outPath = path.join(".", "output", topic) + ".txt";
    fs.writeFileSync(outPath, data);
  });
};

main();
