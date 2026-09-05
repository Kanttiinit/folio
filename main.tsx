import { Hono } from 'hono';
import { compress } from 'hono/compress';
import moment from 'moment';

import Area from './views/Area.tsx';
import Layout from './views/Layout.tsx';
import RestaurantPage from './views/Restaurant.tsx';

type Variables = { lang: 'fi' | 'en' };

const app = new Hono<{ Variables: Variables }>();

const kitchenURL = 'https://kitchen.kanttiinit.fi';

app
  .use(compress())
  .use(async (c, next) => {
    const langParsed = c.req.path.split('/')[1];
    const lang = langParsed === 'fi' || langParsed === 'en' ? langParsed : 'fi';
    c.set('lang', lang);
    await next();
  })
  .get('/restaurant', async (c) => {
    const { day = moment().format('YYYY-MM-DD'), id, lang = 'fi' } = c.req.query();
    try {
      const restaurant = await (await fetch(
        `${kitchenURL}/restaurants/${id}/menu?day=${day}&lang=${lang}`,
      )).json();
      return c.html(
        <RestaurantPage restaurant={restaurant} day={moment(day)} />,
      );
    } catch (e) {
      console.log(e);
      return c.html(
        <Layout title='Error'>
          Failed to fetch data.
        </Layout>,
      );
    }
  })
  .get('/robots.txt', (c) => c.text('User-agent: *\nDisallow:'))
  .get('/:lang/area/:areaId/:day?', async (c) => {
    const day = moment(c.req.param('day'));
    const areaId = Number(c.req.param('areaId')) || 1;
    const date = day.format('YYYY-MM-DD');
    try {
      const areas = await (await fetch(`${kitchenURL}/areas?lang=${c.var.lang}`)).json();
      const area = areas.find((a: any) => a.id === areaId);
      const menus = await (await fetch(
        `${kitchenURL}/menus?restaurants=${
          area.restaurants.map((r: any) => r.id).join(',')
        }&day=${date}&lang=${c.var.lang}`,
      )).json();
      return c.html(
        <Area
          path={c.req.path}
          areas={areas}
          currentArea={area}
          menus={menus}
          day={day}
          lang={c.var.lang}
        />,
      );
    } catch (e) {
      console.log(e);
      return c.html(
        <Layout title='Error'>
          Failed to fetch data.
        </Layout>,
      );
    }
  })
  .get(
    '/:areaId',
    (c) => c.redirect(`/${c.req.query('lang') || 'fi'}/area/${c.req.param('areaId')}`),
  )
  .on('GET', ['/', '/:lang{fi|en}', '/:lang{fi|en}/area'], (c) => c.redirect(`/${c.get('lang')}/area/1`));

Deno.serve({ port: Number(Deno.env.get('PORT')) || 3000 }, app.fetch);
