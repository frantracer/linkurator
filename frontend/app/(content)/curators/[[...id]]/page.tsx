import type {Metadata} from 'next';
import CuratorPageComponent from './components/CuratorPage';

type CuratorPageParams = {
  params: Promise<{ id: string }>
};

export async function generateMetadata(
  {params}: CuratorPageParams,
): Promise<Metadata> {
  const username = (await params).id;
  let title = 'Linkurator';
  let description = 'Recomendaciones curadas de enlaces de alta calidad para aprender y mantenerse informado.';

  if (username) {
    title = username;
    description = `Descubre contenido recomendado por ${username} en Linkurator. Explora enlaces, artículos y recursos seleccionados cuidadosamente por tu curador de confianza para mantenerte informado e inspirado.`;
  }

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [{
        url: 'https://linkurator.com/logo_v1_medium.png',
        alt: 'Linkurator Logo',
        type: 'image/png',
      }],
    },
  }
}

export default async function TopicPage({params}: CuratorPageParams) {
  const {id} = await params;
  return <CuratorPageComponent curatorName={id}/>
}
