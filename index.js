const express = require("express");
const twig = require("twig");
const fetch = require("node-fetch");
const moment = require("moment");
const ua = require("universal-analytics");
const minifyHTML = require("express-minify-html");
const slugify = require("@sindresorhus/slugify");
const url = require("url");
const querystring = require("querystring");

const explainProperty = require("./explainProperty");
const translate = require("./translate");

const cache = new Map();

const get = async (resource, ttl = 600) => {
  const existing = cache.get(resource);
  const now = Math.round(Date.now() / 1000);
  if (existing && existing.expires > now) {
    return existing.data;
  }
  const response = await fetch(`https://kitchen.kanttiinit.fi/${resource}`);
  const data = await response.json();
  cache.set(resource, { data, expires: now + ttl });
  return data;
};

const getDate = day => {
  const now = moment();
  if (day === "today") {
    return now;
  }

  if (day === "tomorrow") {
    return now.add({ day: 1 });
  }

  return moment(day);
};

const app = express();

app.locals.explainProperty = explainProperty;
app.locals.slugify = slugify;

app
  .use(
    minifyHTML({
      override: true,
      exception_url: false,
      htmlMinifier: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyCSS: true
      }
    })
  )
  .use(ua.middleware(process.env.UA_ID))
  .use((req, res, next) => {
    req.visitor.pageview(req.originalUrl).send();
    next();
  })
  .use((req, res, next) => {
    res.locals.lang = req.query.lang || "fi";
    res.locals.translate = translate(res.locals.lang);
    res.locals.changeQueryParam = (key, value) => {
      const parts = url.parse(req.url, true);
      parts.query[key] = value;
      parts.search = querystring.stringify(parts.query);
      return url.format(parts);
    };
    next();
  })
  .set("views", __dirname + "/views")
  .set("view engine", "twig")
  .get("/restaurant", async (req, res) => {
    const { day = moment().format("YYYY-MM-DD"), id, lang = "fi" } = req.query;
    try {
      const [restaurant] = await get(`restaurants?ids=${id}&lang=${lang}`);
      const menus = await get(
        `menus?restaurants=${id}&days=${day}&lang=${lang}`
      );
      res.render("restaurant", {
        restaurant,
        courses: menus[restaurant.id][day],
        day,
        title: restaurant.name + " Menus"
      });
    } catch (e) {
      console.log(e);
      res.status(500).render("index", { lang, error: "Failed to fetch data." });
    }
  })
  .get("/robots.txt", (req, res) => res.send("User-agent: *\nDisallow:"))
  .get("/:areaId?", async (req, res) => {
    const { day = "today" } = req.query;
    const areaId = Number(req.params.areaId) || 1;

    try {
      const areas = await get("areas?idsOnly=1&lang=" + res.locals.lang, 3600);
      const currentArea = areas.find(area => area.id === areaId);
      if (!currentArea) {
        res
          .status(400)
          .render("index", { areas, lang, error: "Invalid area." });
      } else {
        const restaurantIds = currentArea.restaurants.join(",");
        const restaurants = await get(
          `restaurants?ids=${restaurantIds}&lang=${res.locals.lang}`,
          3600
        );
        const now = moment();
        const date = getDate(day).format("YYYY-MM-DD");
        const menus = await get(
          `menus?restaurants=${restaurantIds}&days=${date}&lang=${
            res.locals.lang
          }`,
          1800
        );
        res.render("index", {
          title: "Kanttiinit: " + currentArea.name,
          areas,
          currentArea,
          restaurants: restaurants.sort((a, b) => (a.name > b.name ? 1 : -1)),
          getMenus: restaurantId => menus[restaurantId][date],
          day
        });
      }
    } catch (e) {
      console.log(e);
      res.status(500).render("index", { error: "Failed to fetch data." });
    }
  })
  .listen(process.env.PORT || 3000);
