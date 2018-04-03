const express = require('express');
const twig = require('twig');
const fetch = require('node-fetch');
const moment = require('moment');
const ua = require('universal-analytics');

const cache = new Map();

const get = async (resource, ttl = 600) => {
  const existing = cache.get(resource);
  const now = Math.round(Date.now() / 1000);
  if (existing && existing.expires > now) {
    return existing.data;
  }
  const response = await fetch(`https://kitchen.kanttiinit.fi/${resource}`);
  const data = await response.json();
  cache.set(resource, {data, expires: now + ttl});
  return data;
}

express()
.use(ua.middleware(process.env.UA_ID))
.use((req, res, next) => {
  req.visitor.pageview(req.originalUrl).send();
  next();
})
.set('views', __dirname + '/views')
.set('view engine', 'twig')
.get('/restaurant/:restaurantId', async (req, res) => {
  const {date = moment().format('YYYY-MM-DD'), lang = 'fi'} = req.query;
  try {
    const [restaurant] = await get(`restaurants?ids=${req.params.restaurantId}&lang=${lang}`);
    const menus = await get(`menus?restaurants=${req.params.restaurantId}&days=${date}&lang=${lang}`);
    res.render('restaurant', {
      restaurant,
      courses: menus[restaurant.id][date],
      date,
      title: restaurant.name + ' Menus'
    });
  } catch (e) {
    console.log(e);
    res.status(500).render('index', {lang, error: 'Failed to fetch data.'});
  }
})
.get('/:areaId?', async (req, res) => {
  const {lang = 'fi'} = req.query;
  const areaId = Number(req.params.areaId) || 1;

  try {
    const areas = await get('areas?idsOnly=1&lang=' + lang, 3600);
    const currentArea = areas.find(area => area.id === areaId);
    if (!currentArea) {
      res.status(400).render('index', {areas, lang, error: 'Invalid area.'});
    } else {
      const restaurantIds = currentArea.restaurants.join(',');
      const restaurants = await get(`restaurants?ids=${restaurantIds}&lang=${lang}`, 3600);
      const date = moment().format('YYYY-MM-DD');
      const menus = await get(`menus?restaurants=${restaurantIds}&days=${date}&lang=${lang}`, 1800);
      res.render('index', {
        title: 'Kanttiinit: ' + currentArea.name,
        areas,
        currentArea,
        restaurants: restaurants.sort((a, b) => a.name > b.name ? 1 : -1),
        lang,
        getMenus(restaurantId) {
          return menus[restaurantId][date];
        }
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).render('index', {lang, error: 'Failed to fetch data.'});
  }
})
.listen(process.env.PORT || 3000);
