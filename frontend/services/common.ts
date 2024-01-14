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
  if (filters.display_without_interaction) {
    interactionParams.push(InteractionFilter.WITHOUT_INTERACTIONS);
  }
  if (filters.display_discouraged) {
    interactionParams.push(InteractionFilter.DISCOURAGED);
  }
  if (filters.display_recommended) {
    interactionParams.push(InteractionFilter.RECOMMENDED);
  }
  if (filters.display_hidden) {
    interactionParams.push(InteractionFilter.HIDDEN);
  }
  if (filters.display_viewed) {
    interactionParams.push(InteractionFilter.VIEWED);
  }
  return interactionParams
}
