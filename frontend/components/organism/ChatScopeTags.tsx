'use client';

import React from "react";
import {useTranslations} from "next-intl";
import Tag from "../atoms/Tag";
import CrossButton from "../atoms/CrossButton";
import {ChevronDownIcon, CuratorIcon, RectangleGroup, SubscriptionIcon} from "../atoms/Icons";
import {ChatScope} from "../../entities/Chat";
import {Filters, getFilterDuration} from "../../entities/Filters";
import {InteractionFilter, mapFiltersToInteractionParams} from "../../services/common";
import {formatDurationRange} from "../../utilities/duration";
import {ChatScopeEntity, ChatScopeKind, scopeHasKind, SCOPE_KIND_LABEL_KEYS} from "../../utilities/chatScope";
import useScopeEntities from "../../hooks/useScopeEntities";

type ChatScopeTagsProps = {
  scope?: ChatScope;
  filters: Filters;
  // Interactions don't apply to guests or curators.
  showInteractions: boolean;
  // Without callbacks the tags are read-only.
  onAddEntity?: () => void;
  onRemoveEntity?: (entity: ChatScopeEntity) => void;
  onChangeFilters?: (filters: Filters) => void;
  onOpenFilters?: () => void;
};

const INTERACTION_LABEL_KEYS: Record<InteractionFilter, string> = {
  [InteractionFilter.WITHOUT_INTERACTIONS]: "not_viewed",
  [InteractionFilter.VIEWED]: "viewed",
  [InteractionFilter.RECOMMENDED]: "recommended",
  [InteractionFilter.DISCOURAGED]: "not_recommended",
  [InteractionFilter.HIDDEN]: "archived",
};

const INTERACTION_FILTER_KEYS: Record<InteractionFilter,
  'displayWithoutInteraction' | 'displayViewed' | 'displayRecommended' | 'displayDiscouraged' | 'displayHidden'> = {
  [InteractionFilter.WITHOUT_INTERACTIONS]: "displayWithoutInteraction",
  [InteractionFilter.VIEWED]: "displayViewed",
  [InteractionFilter.RECOMMENDED]: "displayRecommended",
  [InteractionFilter.DISCOURAGED]: "displayDiscouraged",
  [InteractionFilter.HIDDEN]: "displayHidden",
};

export const SCOPE_KIND_ICONS: Record<ChatScopeKind, React.ReactNode> = {
  topic: <RectangleGroup/>,
  subscription: <SubscriptionIcon/>,
  curator: <CuratorIcon/>,
};

// The scope and filters a chat message is searched with, as tags.
const ChatScopeTags = (
  {scope, filters, showInteractions, onAddEntity, onRemoveEntity, onChangeFilters, onOpenFilters}: ChatScopeTagsProps
) => {
  const t = useTranslations("common");
  const entities = useScopeEntities(scope);

  const duration = getFilterDuration(filters);
  const durationLabel = formatDurationRange(duration.min, duration.max);
  const interactions = mapFiltersToInteractionParams(filters);
  const excludedCount = scopeHasKind(scope, 'topic') ? filters.excludedSubscriptions.length : 0;

  return (
    <>
      {entities.length === 0 &&
          <Tag onClick={onAddEntity}>
              <span className="whitespace-nowrap">{t("chat_scope_none")}</span>
            {onAddEntity && <ChevronDownIcon/>}
          </Tag>
      }
      {entities.map(entity => (
        <Tag key={`${entity.kind}:${entity.id}`} onClick={onAddEntity}>
          {SCOPE_KIND_ICONS[entity.kind]}
          <span className="whitespace-nowrap">{entity.name ?? t(SCOPE_KIND_LABEL_KEYS[entity.kind])}</span>
          {onRemoveEntity && <CrossButton onClick={() => onRemoveEntity(entity)}/>}
        </Tag>
      ))}

      <Tag onClick={onOpenFilters}>
        <span className="whitespace-nowrap">{durationLabel ?? t("chat_scope_any_duration")}</span>
      </Tag>
      {filters.textSearch &&
          <Tag onClick={onOpenFilters}><span className="whitespace-nowrap">&quot;{filters.textSearch}&quot;</span></Tag>
      }
      {showInteractions &&
          interactions.map(interaction => (
            <Tag key={interaction} onClick={onOpenFilters}>
              <span className="whitespace-nowrap">{t(INTERACTION_LABEL_KEYS[interaction])}</span>
              {/* The last interaction can't be removed: nothing would match. */}
              {onChangeFilters && interactions.length > 1 &&
                  <CrossButton
                      onClick={() => onChangeFilters({...filters, [INTERACTION_FILTER_KEYS[interaction]]: false})}/>
              }
            </Tag>
          ))
      }
      {excludedCount > 0 &&
          <Tag onClick={onOpenFilters}>
            <span className="whitespace-nowrap">{t("chat_scope_excluded_count", {count: excludedCount})}</span>
          </Tag>
      }
    </>
  );
};

export default ChatScopeTags;
