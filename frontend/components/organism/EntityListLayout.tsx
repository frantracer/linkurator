import React from "react";
import {useTranslations} from "next-intl";
import Button from "../atoms/Button";
import {MagnifyingGlassIcon} from "../atoms/Icons";
import EntityList, {EntityListFacets, EntityListSection} from "./EntityList";
import PageHeader from "./PageHeader";
import {openSearchPalette, SearchFilter} from "../../utilities/searchPaletteAction";

export type EntityListAction = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

type EntityListLayoutProps = {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  discoverFilter: SearchFilter;
  mainAction?: EntityListAction;
  filterPlaceholder: string;
  filterText: string;
  onFilterTextChange: (value: string) => void;
  facets?: EntityListFacets;
  totalCount: number;
  isLoading: boolean;
  emptyState: React.ReactNode;
  sections: EntityListSection[];
}

const EntityListLayout = (
  {
    title,
    icon,
    subtitle,
    discoverFilter,
    mainAction,
    filterPlaceholder,
    filterText,
    onFilterTextChange,
    facets,
    totalCount,
    isLoading,
    emptyState,
    sections,
  }: EntityListLayoutProps
) => {
  const t = useTranslations("common");
  const isEmpty = !isLoading && totalCount === 0;

  // The header keeps room for the list's scrollbar, like the filter bar and the list below it
  return (
    <>
      <PageHeader
        title={title}
        icon={icon}
        subtitle={!isLoading && !isEmpty ? subtitle : undefined}
        reserveScrollbarSpace={true}
        actions={<>
          <Button primary={false} clickAction={() => openSearchPalette(discoverFilter)} tooltip={t("discover")}>
            <MagnifyingGlassIcon/>
            <span className="hidden sm:inline">{t("discover")}</span>
            <kbd className="hidden lg:inline kbd kbd-xs">⌘K</kbd>
          </Button>
          {mainAction && (
            <Button clickAction={mainAction.onClick} tooltip={mainAction.label}>
              {mainAction.icon}
              <span className="hidden sm:inline">{mainAction.label}</span>
            </Button>
          )}
        </>}
      />
      <EntityList
        showFilterBar={true}
        filterPlaceholder={filterPlaceholder}
        filterText={filterText}
        onFilterTextChange={onFilterTextChange}
        facets={facets}
        totalCount={totalCount}
        isLoading={isLoading}
        emptyState={emptyState}
        sections={sections}
      />
    </>
  );
}

export default EntityListLayout;
