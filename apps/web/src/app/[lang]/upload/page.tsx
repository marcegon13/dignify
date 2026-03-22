import UploadClient from './UploadClient';
export async function generateStaticParams() {
  return [{ lang: 'es' }, { lang: 'en' }, { lang: 'pt' }];
}
export default function Page() {
  return <UploadClient />;
}
