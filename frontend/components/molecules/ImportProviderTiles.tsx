import React from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import classNames from "classnames";
import {configuration} from "../../configuration";
import {getProviderIcon} from "../../entities/Provider";
import useProviders from "../../hooks/useProviders";
import {ImportStep} from "../../utilities/importModalAction";

type ImportProviderTilesProps = {
  onChooseStep: (step: ImportStep) => void;
  columns: 2 | 4;
}

type Tile = {
  provider: string;
  name: string;
  hint: string;
  action: string;
  onClick: () => void;
}

const ImportProviderTiles = ({onChooseStep, columns}: ImportProviderTilesProps) => {
  const t = useTranslations("common");
  const router = useRouter();
  const {providers} = useProviders();

  const tiles: Tile[] = [
    {
      provider: "youtube",
      name: "YouTube",
      hint: t("import_youtube_hint"),
      action: t("import"),
      onClick: () => router.push(configuration.SUBSCRIPTIONS_YOUTUBE_IMPORT_URL),
    },
    {
      provider: "spotify",
      name: "Spotify",
      hint: t("import_spotify_hint"),
      action: t("import"),
      onClick: () => onChooseStep("spotify"),
    },
    {
      provider: "patreon",
      name: "Patreon",
      hint: t("import_patreon_hint"),
      action: t("import"),
      onClick: () => router.push(configuration.SUBSCRIPTIONS_PATREON_IMPORT_URL),
    },
    {
      provider: "rss",
      name: "RSS / OPML",
      hint: t("import_rss_hint"),
      action: t("upload_file"),
      onClick: () => onChooseStep("opml"),
    },
  ].filter(tile => providers.some(provider => provider.name === tile.provider));

  return (
    <ul className={classNames("grid grid-cols-1 sm:grid-cols-2 gap-3", {"lg:grid-cols-4": columns === 4})}>
      {tiles.map((tile, index) => (
        <li key={tile.provider} className="flex flex-col gap-2 p-4 rounded-xl border border-neutral bg-base-100 text-left">
          <img src={getProviderIcon(providers, tile.provider)} alt="" className="w-8 h-8 rounded-lg"/>
          <span className="font-semibold">{tile.name}</span>
          <span className="flex-1 text-xs text-base-content/70">{tile.hint}</span>
          <button type="button" onClick={tile.onClick}
                  className={classNames("btn btn-sm rounded-md mt-1", {
                    "btn-primary": index === 0,
                    "btn-outline border-base-content/30": index !== 0,
                  })}>
            {tile.action}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ImportProviderTiles;
