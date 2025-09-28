import ALink from "../atoms/ALink";
import {paths} from "../../configuration";

const LinkuratorHeader = () => {
  return (
    <ALink href={paths.LANDING}>
      <h1 className="text-5xl font-bold py-5 uppercase text-center">
        <img src="/logo_v1_medium.png" alt="Linkurator logo" className="w-20 h-20 inline-block mx-4"/>
        Linkurator
      </h1>
    </ALink>
  )
}

export default LinkuratorHeader;