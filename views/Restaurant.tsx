import type { FC } from 'hono/jsx';
import moment from 'moment';

import Layout from './Layout.tsx';
import { Course } from './types.ts';

type Restaurant = {
  name: string;
  menus: { courses: Course[] }[];
};

type Props = {
  restaurant: Restaurant;
  day: moment.Moment;
};

const RestaurantPage: FC<Props> = ({ restaurant, day }) => {
  const courses = restaurant.menus[0]?.courses ?? [];

  return (
    <Layout title={`${restaurant.name} Menus`}>
      <h1 class='restaurant-name'>{restaurant.name}</h1>
      <small class='date'>{day.format('dd D/M/YYYY')}</small>
      {courses.length
        ? (
          <ul class='courses'>
            {courses.map((course, i) => (
              <li key={i}>
                {course.title} <em>{course.properties?.join(', ')}</em>
              </li>
            ))}
          </ul>
        )
        : <p>No menus found.</p>}
    </Layout>
  );
};

export default RestaurantPage;
