const express = require('express');
const twig = require('twig');
const apicache = require('apicache');
const fetch = require('node-fetch');
const moment = require('moment');

const get = async resource => {
  const response = await fetch(`https://kitchen.kanttiinit.fi/${resource}`);
  return response.json();
}

express()
.set('views', __dirname + '/views')
.set('view engine', 'twig')
.get('/:areaId?', async (req, res) => {
  const {lang = 'fi'} = req.query;
  const areaId = Number(req.params.areaId) || 1;

  try {
    const areas = await get('areas?idsOnly=1&lang=' + lang);
    const currentArea = areas.find(area => area.id === areaId);
    if (!currentArea) {
      res.status(400).render('index', {areas, lang, error: 'Invalid area.'});
    } else {
      const restaurantIds = currentArea.restaurants.join(',');
      const restaurants = await get(`restaurants?ids=${restaurantIds}&lang=${lang}`);
      const date = moment().format('YYYY-MM-DD');
      const menus = await get(`menus?restaurants=${restaurantIds}&days=${date}&lang=${lang}`);
      res.render('index', {
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
