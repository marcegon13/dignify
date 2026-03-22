import AdminClient from './AdminClient';
export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }, { lang: 'pt' }];
}
export default function Page() {
  return <AdminClient />;
}
