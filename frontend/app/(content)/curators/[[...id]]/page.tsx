import type { Metadata } from 'next';
import { getCurator } from '../../../../services/curatorService';
import CuratorPageComponent from './components/CuratorPage';

type CuratorPageParams = {
  params: Promise<{ id: string }>
};

export async function generateMetadata(
  { params }: CuratorPageParams,
): Promise<Metadata> {
  const id = (await params).id;
  const defaultTitle = 'Linkurator';
  let title = defaultTitle;

  if (id) {
    const curator = await getCurator(id)
    title = curator ? curator.username : defaultTitle;
  }

  return {
    title: title,
  }
}

export default async function TopicPage({ params }: CuratorPageParams) {
  const { id } = await params;
  return <CuratorPageComponent curatorName={id} />
}
