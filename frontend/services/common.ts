import {Filters} from "../entities/Filters";

export enum InteractionFilter {
  WITHOUT_INTERACTIONS = "without_interactions",
  RECOMMENDED = "recommended",
  DISCOURAGED = "discouraged",
  VIEWED = "viewed",
  HIDDEN = "hidden",
}

export const mapFiltersToInteractionParams = (filters: Filters): InteractionFilter[] => {
  const interactionParams: InteractionFilter[] = [];
  if (filters.displayWithoutInteraction) {
    interactionParams.push(InteractionFilter.WITHOUT_INTERACTIONS);
  }
  if (filters.displayDiscouraged) {
    interactionParams.push(InteractionFilter.DISCOURAGED);
  }
  if (filters.displayRecommended) {
    interactionParams.push(InteractionFilter.RECOMMENDED);
  }
  if (filters.displayHidden) {
    interactionParams.push(InteractionFilter.HIDDEN);
  }
  if (filters.displayViewed) {
    interactionParams.push(InteractionFilter.VIEWED);
  }
  return interactionParams
}
