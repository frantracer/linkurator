import type {Metadata} from 'next';
import {getTopic} from '../../../../services/topicService';
import TopicPageComponent from './components/TopicPage';
import TopicsListPageComponent from './components/TopicsListPage';

type TopicPageParams = {
  params: Promise<{ id: string }>
};

export async function generateMetadata(
  {params}: TopicPageParams,
): Promise<Metadata> {
  const id = (await params).id;
  const defaultTitle = 'Linkurator';
  let title = defaultTitle;

  if (id) {
    const topic = await getTopic(id)
    title = topic ? topic.name : defaultTitle;
  }

  return {
    title: title,
  }
}

export default async function TopicPage({params}: TopicPageParams) {
  const {id} = await params;
  if (!id) {
    return <TopicsListPageComponent/>
  }
  return <TopicPageComponent topicId={id}/>
}
