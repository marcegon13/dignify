import HomeClient from './HomeClient';

export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }, { lang: 'pt' }];
}

export default function Page() {
  return <HomeClient />;
}
