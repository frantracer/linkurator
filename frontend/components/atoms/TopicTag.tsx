import React from "react";
import Link from "next/link";
import {paths} from "../../configuration";
import {Topic} from "../../entities/Topic";

type TopicTagProps = {
  topic: Topic
}

const TopicTag = ({topic}: TopicTagProps) => {
  return <div className="badge badge-outline mx-2">
    <Link href={paths.TOPICS + "/" + topic.uuid} scroll={false}>
      {topic.name}
    </Link>
  </div>
}

export default TopicTag;
