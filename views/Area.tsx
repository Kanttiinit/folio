import { FC, Fragment } from 'hono/jsx';
import moment from 'moment';
import slugify from '@sindresorhus/slugify';

import Layout from './Layout.tsx';
import { type Area, Course } from './types.ts';
import { explainProperty, translate } from './utils.ts';

function changePathAt(path: string, index: number, value: string) {
  const parts = path.split('/');
  parts[index + 1] = value;
  return parts.join('/');
}

type Props = {
  areas?: Area[];
  currentArea: Area;
  day: moment.Moment;
  menus: Record<number, Record<string, Course[]>>;
  lang: 'fi' | 'en';
  path: string;
};

const Area: FC<Props> = ({
  areas,
  currentArea,
  day,
  path,
  menus,
  lang,
}) => {
  const now = moment();
  const tomorrow = now.clone().add({ days: 1 });
  const isToday = now.isSame(day, 'day');
  const isTomorrow = tomorrow.isSame(day, 'day');
  const weekday = day.format('ddd');
  const weekdayIndex = day.get('isoWeekday');
  const restaurants = currentArea.restaurants.sort((a, b) => a.name > b.name ? 1 : -1);

  return (
    <Layout title={`Kanttiinit: ${currentArea.name}`}>
      {areas?.length
        ? (
          <ul class='area-list'>
            {areas.map((area) => (
              <li
                key={area.id}
                class={area.id === currentArea?.id ? 'current' : undefined}
              >
                <a href={changePathAt(path, 2, String(area.id))}>{area.name}</a>
              </li>
            ))}
          </ul>
        )
        : null}

      <a class={isToday ? 'current' : undefined} href={changePathAt(path, 3, '')}>
        {translate(lang, 'today')}
      </a>
      &nbsp;
      <a
        class={isTomorrow ? 'current' : undefined}
        href={changePathAt(path, 3, tomorrow.format('YYYY-MM-DD'))}
      >
        {translate(lang, 'tomorrow')}
      </a>
      {!isToday && !isTomorrow && day.isValid()
        ? (
          <a class='current' href={changePathAt(path, 3, day.format('YYYY-MM-DD'))}>
            {day.format('dd D/M/YYYY')}
          </a>
        )
        : null}
      {' • '}
      <a class={lang === 'fi' ? 'current' : undefined} href={changePathAt(path, 0, 'fi')}>
        Finnish
      </a>
      &nbsp;
      <a class={lang === 'en' ? 'current' : undefined} href={changePathAt(path, 0, 'en')}>
        English
      </a>

      {restaurants?.length
        ? (
          <ul class='restaurant-list'>
            {restaurants.map((restaurant) => {
              const courses = menus[restaurant.id]?.[day.format('YYYY-MM-DD')] ?? [];
              const slug = slugify(restaurant.name);
              return (
                <li key={restaurant.id} id={slug} class='restaurant'>
                  <a href={`#${slug}`}>
                    <h3>{restaurant.name}</h3>
                  </a>
                  <div class='restaurant-meta'>
                    {weekday} {restaurant.openingHours[weekdayIndex]}
                    {' • '}
                    <a href={restaurant.url}>{translate(lang, 'homepage')}</a>
                    {' • '}
                    <a
                      class='restaurant-address'
                      href={`https://www.google.fi/maps/search/${
                        encodeURIComponent(
                          restaurant.address,
                        )
                      }`}
                    >
                      {restaurant.address}
                    </a>
                  </div>
                  {courses.length === 0 ? <small>{translate(lang, 'noMenu')}</small> : (
                    <ul>
                      {courses.map((course, i) => (
                        <li key={i}>
                          {course.title}
                          {course.properties?.length
                            ? (
                              <>
                                {' ('}
                                {course.properties.map((property, j) => (
                                  <Fragment key={property}>
                                    {j > 0 ? ', ' : null}
                                    <abbr title={explainProperty(property)}>
                                      {property}
                                    </abbr>
                                  </Fragment>
                                ))}
                                {')'}
                              </>
                            )
                            : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )
        : null}
    </Layout>
  );
};

export default Area;
