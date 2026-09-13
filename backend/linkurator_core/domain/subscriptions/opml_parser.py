from __future__ import annotations

import xml.etree.ElementTree as ET
from dataclasses import dataclass, field

from linkurator_core.domain.common.exceptions import InvalidOpmlFileError


@dataclass
class OpmlFeedGroup:
    name: str | None
    feed_urls: list[str] = field(default_factory=list)


def parse_opml_groups(opml_content: str) -> list[OpmlFeedGroup]:
    """
    Parse an OPML document into feed groups.

    A top-level ``<outline xmlUrl="...">`` is an ungrouped feed. A top-level
    ``<outline text="...">`` with nested ``<outline xmlUrl="...">`` children is
    a category: its children's feed URLs are grouped under its name. Only one
    level of nesting is supported, matching typical OPML exports.
    """
    try:
        root = ET.fromstring(opml_content)
    except ET.ParseError as e:
        msg = f"Failed to parse OPML file: {e}"
        raise InvalidOpmlFileError(msg) from e

    body = root.find("body")
    if body is None:
        msg = "No body element found in OPML file"
        raise InvalidOpmlFileError(msg)

    groups: list[OpmlFeedGroup] = []
    ungrouped = OpmlFeedGroup(name=None)

    for outline in body.findall("outline"):
        feed_url = outline.get("xmlUrl")
        if feed_url:
            ungrouped.feed_urls.append(feed_url)
            continue

        children_urls = [child_url for child in outline.findall("outline")
                          if (child_url := child.get("xmlUrl"))]
        if children_urls:
            group_name = outline.get("text") or outline.get("title") or "Untitled"
            groups.append(OpmlFeedGroup(name=group_name, feed_urls=children_urls))

    if ungrouped.feed_urls:
        groups.append(ungrouped)

    return groups
