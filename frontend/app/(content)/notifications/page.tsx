import type {Metadata} from 'next';
import NotificationsPageComponent from './components/NotificationsPage';

export const metadata: Metadata = {
  title: 'Linkurator',
};

export default function NotificationsPage() {
  return <NotificationsPageComponent/>
}
