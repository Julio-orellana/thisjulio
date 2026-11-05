import { getRequestConfig } from 'next-intl/server';
import { messages } from './messages';
import { isLocale, routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: messages[locale],
    timeZone: 'America/Guatemala',
  };
});
