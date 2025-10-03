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
  let description = 'Curated recommendations';

  if (username) {
    title = username;
    description = `Recommendations from ${username}`;
  }

  return {
    title: title,
    description: description,
    openGraph: {
      images: ['/logo_v1_medium.png'],
    },
  }
}

export default async function TopicPage({params}: CuratorPageParams) {
  const {id} = await params;
  return <CuratorPageComponent curatorName={id}/>
}
