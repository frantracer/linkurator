import {v4 as uuidv4} from 'uuid';
import {paths} from "../configuration";
import {ChatScope} from "../entities/Chat";
import {Filters, getDurationGroupFromRange, getFilterDuration} from "../entities/Filters";
import {mapFiltersToInteractionParams} from "../services/common";

const STORAGE_KEY_PREFIX = 'linkurator:chat-scope:';

// A page's scope is handed to the chat page through sessionStorage, keyed by the new chat's uuid,
// so it survives the hard navigation to /chats/[id].
export function stashChatScope(chatId: string, scope: ChatScope): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_PREFIX + chatId, JSON.stringify(scope));
  } catch {
    // sessionStorage may be unavailable; the chat just won't be pre-scoped.
  }
}

export function consumeChatScope(chatId: string): ChatScope | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_PREFIX + chatId);
    if (!raw) return undefined;
    sessionStorage.removeItem(STORAGE_KEY_PREFIX + chatId);
    return JSON.parse(raw) as ChatScope;
  } catch {
    return undefined;
  }
}

// Path of a new chat that starts with the given scope.
export function newScopedChatPath(scope: ChatScope): string {
  const chatId = uuidv4();
  stashChatScope(chatId, scope);
  return paths.CHATS + '/' + chatId;
}

export type ChatScopeKind = 'topic' | 'subscription' | 'curator';

export const SCOPE_KIND_LABEL_KEYS = {
  topic: 'chat_scope_topic',
  subscription: 'chat_scope_subscription',
  curator: 'chat_scope_curator',
} as const satisfies Record<ChatScopeKind, string>;

export type ChatScopeEntity = {
  kind: ChatScopeKind;
  id: string;
};

const SCOPE_KIND_IDS_FIELDS = {
  topic: 'topicIds',
  subscription: 'subscriptionIds',
  curator: 'curatorIds',
} as const satisfies Record<ChatScopeKind, keyof ChatScope>;

const SCOPE_KINDS = Object.keys(SCOPE_KIND_IDS_FIELDS) as ChatScopeKind[];

// Topics, subscriptions and curators can be combined: the chat searches the union of them.
export function getScopeEntities(scope: ChatScope | undefined): ChatScopeEntity[] {
  return SCOPE_KINDS.flatMap(kind =>
    (scope?.[SCOPE_KIND_IDS_FIELDS[kind]] ?? []).map(id => ({kind, id})));
}

export function scopeHasKind(scope: ChatScope | undefined, kind: ChatScopeKind): boolean {
  return (scope?.[SCOPE_KIND_IDS_FIELDS[kind]]?.length ?? 0) > 0;
}

// The only kind in the scope, or undefined when it is empty or mixes kinds.
export function getSingleScopeKind(scope: ChatScope | undefined): ChatScopeKind | undefined {
  const kinds = SCOPE_KINDS.filter(kind => scopeHasKind(scope, kind));
  return kinds.length === 1 ? kinds[0] : undefined;
}

// Interactions are the user's own, so they don't apply to a scope made only of curators.
export function scopeUsesInteractions(scope: ChatScope | undefined): boolean {
  return getSingleScopeKind(scope) !== 'curator';
}

export function isEntityInScope(scope: ChatScope | undefined, entity: ChatScopeEntity): boolean {
  return scope?.[SCOPE_KIND_IDS_FIELDS[entity.kind]]?.includes(entity.id) ?? false;
}

export function addScopeEntity(scope: ChatScope | undefined, entity: ChatScopeEntity): ChatScope {
  if (isEntityInScope(scope, entity)) return scope ?? {};
  const field = SCOPE_KIND_IDS_FIELDS[entity.kind];
  return {...scope, [field]: [...(scope?.[field] ?? []), entity.id]};
}

// Without any entity left the scope is the "everything" one, which is no scope at all.
export function removeScopeEntity(scope: ChatScope | undefined, entity: ChatScopeEntity): ChatScope | undefined {
  if (!scope) return undefined;
  const field = SCOPE_KIND_IDS_FIELDS[entity.kind];
  const remaining = {...scope, [field]: (scope[field] ?? []).filter(id => id !== entity.id)};
  return getScopeEntities(remaining).length > 0 ? remaining : undefined;
}

const secondsToMinutes = (seconds: number | undefined): number | undefined =>
  seconds !== undefined ? Math.round(seconds / 60) : undefined;

// Inverse of scopeFromFilters.
export function filtersFromScope(scope: ChatScope, defaults: Filters): Filters {
  const included = scope.includeInteractions;
  const durationGroup = getDurationGroupFromRange(scope.minDuration, scope.maxDuration);
  return {
    textSearch: scope.textSearch || "",
    displayWithoutInteraction: included ? included.includes('without_interactions') : defaults.displayWithoutInteraction,
    displayViewed: included ? included.includes('viewed') : defaults.displayViewed,
    displayDiscouraged: included ? included.includes('discouraged') : defaults.displayDiscouraged,
    displayRecommended: included ? included.includes('recommended') : defaults.displayRecommended,
    displayHidden: included ? included.includes('hidden') : defaults.displayHidden,
    durationGroup,
    minDuration: durationGroup === 'custom' ? secondsToMinutes(scope.minDuration) : undefined,
    maxDuration: durationGroup === 'custom' ? secondsToMinutes(scope.maxDuration) : undefined,
    excludedSubscriptions: scope.excludedSubscriptions || [],
  };
}

export function scopeFromFilters(filters: Filters, base: ChatScope): ChatScope {
  const duration = getFilterDuration(filters);
  const interactions = mapFiltersToInteractionParams(filters);
  return {
    ...base,
    textSearch: filters.textSearch || undefined,
    minDuration: duration.min,
    maxDuration: duration.max,
    // Nothing ticked means no restriction, as on the pages.
    includeInteractions: interactions.length > 0 ? interactions : undefined,
    excludedSubscriptions: scopeHasKind(base, 'topic') ? filters.excludedSubscriptions : [],
  };
}
