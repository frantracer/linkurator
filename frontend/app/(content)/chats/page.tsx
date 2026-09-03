import type {Metadata} from 'next';
import ChatsListPageComponent from './components/ChatsListPage';

export const metadata: Metadata = {
  title: 'Linkurator',
};

export default function ChatsPage() {
  return <ChatsListPageComponent/>
}
