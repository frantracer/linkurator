import VideoCard from "./VideoCard";
import {SubscriptionItem} from "../../entities/SubscriptionItem";
import React from "react";
import {ITEMS_PER_PAGE} from "../../utilities/constants";
import FlexRow from "../atoms/FlexRow";
import {Spinner} from "../atoms/Spinner";
import {InfoBanner} from "../atoms/InfoBanner";

type CuratorVideoCardGridProps = {
  refreshItem: (itemId: string) => void,
  fetchMoreItems: () => void,
  items: SubscriptionItem[];
  showInteractions: boolean;
  isLoading: boolean;
  isFinished: boolean;
  handleScroll: (event: React.UIEvent<HTMLElement>) => void,
}

const CuratorVideoCardGrid = (props: CuratorVideoCardGridProps) => {

  const cards = [];

  for (let i = 0; i < props.items.length; i++) {
    const item = props.items[i];
    cards.push(
      <div className="m-4" key={item.uuid}>
        <VideoCard
          item={item}
          subscription={undefined}
          withInteractions={props.showInteractions}
          onChange={() => props.refreshItem(item.uuid)}
        />
      </div>
    );
  }

  if (!props.isFinished && !props.isLoading && cards.length < ITEMS_PER_PAGE) {
    props.fetchMoreItems()
  }

  return (
    <main onScroll={props.handleScroll} className="flex flex-col w-full overflow-auto">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4
              justify-items-center justify-content-center">
        {cards}
      </div>
      {props.isLoading &&
          <FlexRow position={"center"}>
              <Spinner/>
              <span>{"Cargando..."}</span>
          </FlexRow>
      }
      {props.isFinished && !props.isLoading &&
          <FlexRow position={"center"}>
              <InfoBanner>{"No hay más contenido que mostrar"}</InfoBanner>
          </FlexRow>
      }
    </main>
  )
}

export default CuratorVideoCardGrid;
