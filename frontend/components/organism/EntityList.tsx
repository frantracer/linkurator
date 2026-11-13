import React, {useRef, useState} from "react";
import {useTranslations} from "next-intl";
import Collapse from "../atoms/Collapse";
import Tag from "../atoms/Tag";
import EntityCardGridSkeleton from "../molecules/EntityCardGridSkeleton";
import PageFilterBar from "../molecules/PageFilterBar";
import SearchBar from "../molecules/SearchBar";
import EmptyStateNoMatches from "./EmptyStateNoMatches";
import useWheelScrollsHorizontally from "../../hooks/useWheelScrollsHorizontally";

export type EntityListFacet = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  count: number;
}

export type EntityListFacets = {
  options: EntityListFacet[];
  selected: string | null;
  onSelect: (facet: string | null) => void;
}

export type EntityListSection = {
  key: string;
  title: string;
  icon: React.ReactNode;
  items: React.ReactNode[];
}

type EntityListProps = {
  showFilterBar: boolean;
  filterPlaceholder: string;
  filterText: string;
  onFilterTextChange: (value: string) => void;
  facets?: EntityListFacets;
  totalCount: number;
  isLoading: boolean;
  emptyState: React.ReactNode;
  sections: EntityListSection[];
}

type FacetTagsProps = {
  facets: EntityListFacets;
  totalCount: number;
}

const FacetTags = ({facets, totalCount}: FacetTagsProps) => {
  const t = useTranslations("common");
  const stripRef = useRef<HTMLDivElement>(null);
  useWheelScrollsHorizontally(stripRef);

  return (
    <div ref={stripRef} role="group" aria-label={t("filters")}
         className="flex flex-row flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide min-w-0">
      <Tag selected={facets.selected === null} onClick={() => facets.onSelect(null)}>
        {t("all")}
        <span className="font-normal opacity-70">{totalCount}</span>
      </Tag>
      {facets.options.map(facet => (
        <Tag key={facet.key} selected={facets.selected === facet.key} onClick={() => facets.onSelect(facet.key)}>
          {facet.icon}
          {facet.label}
          <span className="font-normal opacity-70">{facet.count}</span>
        </Tag>
      ))}
    </div>
  );
}

// The filter bar and the list keep room for the scrollbar, so the margins stay the same whether or not the list
// is long enough to scroll
const EntityList = (
  {
    showFilterBar,
    filterPlaceholder,
    filterText,
    onFilterTextChange,
    facets,
    totalCount,
    isLoading,
    emptyState,
    sections,
  }: EntityListProps
) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const visibleSections = sections.filter(section => section.items.length > 0);
  const visibleCount = visibleSections.reduce((count, section) => count + section.items.length, 0);
  const isEmpty = !isLoading && totalCount === 0;

  const clearFilters = () => {
    onFilterTextChange("");
    facets?.onSelect(null);
  }

  return (
    <>
      {showFilterBar && !isEmpty && (
        <PageFilterBar width="wide">
          <div className="w-full sm:max-w-sm shrink-0">
            <SearchBar placeholder={filterPlaceholder} value={filterText} handleChange={onFilterTextChange}
                       icon="filter"/>
          </div>
          {facets && <FacetTags facets={facets} totalCount={totalCount}/>}
        </PageFilterBar>
      )}
      <div
        className="flex flex-col flex-1 min-h-0 bg-base-300 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] pb-mobile-nav">
        <div className="flex flex-col gap-6 p-4 max-w-7xl w-full mx-auto">
          {isLoading && <EntityCardGridSkeleton/>}

          {isEmpty && emptyState}

          {!isLoading && !isEmpty && visibleCount === 0 && (
            <EmptyStateNoMatches onClearFilters={clearFilters}/>
          )}

          {visibleSections.map(section => (
            <Collapse
              key={section.key}
              flush={true}
              isOpen={openSections[section.key] ?? true}
              onToggle={(isOpen) => setOpenSections(prev => ({...prev, [section.key]: isOpen}))}
              title={
                <div className="flex flex-row gap-2 items-center">
                  {section.icon}
                  <h2 className="text-xl">{section.title} ({section.items.length})</h2>
                </div>
              }
              content={
                <div
                  className="grid grid-cols-[repeat(auto-fill,minmax(275px,1fr))] gap-4 justify-items-center justify-content-center">
                  {section.items}
                </div>
              }
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default EntityList;
