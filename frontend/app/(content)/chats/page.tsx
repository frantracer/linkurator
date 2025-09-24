'use client';

import {useRouter} from "next/navigation";
import {paths} from "../../../configuration";
import {v4 as uuidv4} from 'uuid';

export default function ChatPage() {
  const router = useRouter()
  const newChatId = uuidv4()
  router.push(paths.CHATS + "/" + newChatId)
}
