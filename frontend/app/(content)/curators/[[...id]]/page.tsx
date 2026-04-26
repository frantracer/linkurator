import type {Metadata} from 'next';
import CuratorPageComponent from './components/CuratorPage';
import CuratorsListPageComponent from './components/CuratorsListPage';

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
    },
  }
}

export default async function CuratorPage({params}: CuratorPageParams) {
  const {id} = await params;
  if (!id) {
    return <CuratorsListPageComponent/>
  }
  return <CuratorPageComponent curatorName={id}/>
}
