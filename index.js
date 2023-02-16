require("dotenv").config();
const express = require("express");
const twig = require("twig");
const moment = require("moment");
const ua = require("universal-analytics");
const minifyHTML = require("express-minify-html");
const slugify = require("@sindresorhus/slugify");
const url = require("url");
const { request } = require("graphql-request");

const explainProperty = require("./explainProperty");
const translate = require("./translate");

const app = express();

const kitchenURL = "https://kitchen.kanttiinit.fi";

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
    res.locals.lang = req.path.split("/")[1] || "fi";
    res.locals.translate = translate(res.locals.lang);
    res.locals.changePathAt = (index, value) => {
      const parts = req.path.split("/");
      parts[index + 1] = value;
      return parts.join("/");
    };
    next();
  })
  .set("views", __dirname + "/views")
  .set("view engine", "twig")
  .get("/restaurant", async (req, res) => {
    const { day = moment().format("YYYY-MM-DD"), id, lang = "fi" } = req.query;
    try {
      const query = `
        {
          restaurant(id: ${id}, lang: ${lang}) {
            name
            courses(day: "${day}") {
              title
              properties
            }
          }
        }
      `;
      const data = await request(`${kitchenURL}/graphql`, query);
      res.render("restaurant", {
        restaurant: data.restaurant,
        day,
        title: data.restaurant.name + " Menus"
      });
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .render("error", { lang, errorMessage: "Failed to fetch data." });
    }
  })
  .get("/robots.txt", (req, res) => res.send("User-agent: *\nDisallow:"))
  .get("/:lang/area/:areaId/:day?", async (req, res) => {
    const day = moment(req.params.day);
    const areaId = Number(req.params.areaId) || 1;
    const date = day.format("YYYY-MM-DD");

    try {
      if (!day.isValid()) {
        res
          .status(400)
          .render("area", { areas, currentArea, error: "Invalid date." });
      } else {
        const query = `
        {
          areas(lang: ${res.locals.lang}) {
            id
            name
          }
          area(id: ${areaId}, lang: ${res.locals.lang}) {
            id
            name
            restaurants {
              name
              address
              url
              openingHours
              courses(day: "${date}") {
                title
                properties
              }
            }
          }
        }
      `;
        const data = await request(`${kitchenURL}/graphql`, query);
        const now = moment();
        const tomorrow = now.clone().add({ days: 1 });
        res.render("area", {
          title: "Kanttiinit: " + data.area.name,
          areas: data.areas,
          currentArea: data.area,
          weekday: day.format("ddd"),
          weekdayIndex: day.get("isoWeekday"),
          isToday: now.isSame(day, "day"),
          isTomorrow: tomorrow.isSame(day, "day"),
          restaurants: data.area.restaurants.sort((a, b) =>
            a.name > b.name ? 1 : -1
          ),
          day,
          tomorrow: tomorrow.format("YYYY-MM-DD")
        });
      }
    } catch (e) {
      console.log(e);
      res
        .status(500)
        .render("error", { errorMessage: "Failed to fetch data." });
    }
  })
  .get("/:areaId", (req, res) =>
    res.redirect(301, `/${req.query.lang || "fi"}/area/${req.params.areaId}`)
  )
  .get(/(^\/(fi|en)(\/area)?)|^\/$/, (req, res) =>
    res.redirect(`/${res.locals.lang}/area/1`)
  )
  .listen(process.env.PORT || 3000, '0.0.0.0');
