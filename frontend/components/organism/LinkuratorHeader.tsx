import ALink from "../atoms/ALink";
import {paths} from "../../configuration";

const LinkuratorHeader = () => {
  return (
    <ALink href={paths.LANDING}>
      <span className="flex flex-row items-center justify-center gap-2 py-5 text-2xl font-bold">
        <img src="/logo_v1_medium.png" alt="" className="w-10 h-10"/>
        Linkurator
      </span>
    </ALink>
  )
}

export default LinkuratorHeader;