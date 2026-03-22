import ProfileClient from './ProfileClient';
export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }, { lang: 'pt' }];
}
export default function Page() {
  return <ProfileClient />;
}
