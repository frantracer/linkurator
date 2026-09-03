import {useQueryClient} from "@tanstack/react-query";
import {InteractionType, interactWithItem, removeInteractionWithItem} from "../services/interactionService";

const useItemInteraction = () => {
  const queryClient = useQueryClient();

  const invalidateCaches = () => {
    queryClient.invalidateQueries({queryKey: ["topicItems"]});
    queryClient.invalidateQueries({queryKey: ["subscriptionItems"]});
    queryClient.invalidateQueries({queryKey: ["curatorItems"]});
  };

  const onChangeSwapButton = async (itemUuid: string, interactionType: InteractionType, checked: boolean) => {
    if (checked) {
      await interactWithItem(itemUuid, interactionType);
    } else {
      await removeInteractionWithItem(itemUuid, interactionType);
    }
    invalidateCaches();
  };

  return {onChangeSwapButton};
};

export default useItemInteraction;
