import pytest

from linkurator_core.domain.common.exceptions import InvalidOpmlFileError
from linkurator_core.domain.subscriptions.opml_parser import parse_opml_groups


def test_parse_opml_with_flat_list_of_feeds() -> None:
    opml = """<?xml version="1.0"?>
    <opml version="2.0">
        <body>
            <outline text="Feed One" xmlUrl="https://example.com/feed1.xml"/>
            <outline text="Feed Two" xmlUrl="https://example.com/feed2.xml"/>
        </body>
    </opml>
    """

    groups = parse_opml_groups(opml)

    assert len(groups) == 1
    assert groups[0].name is None
    assert groups[0].feed_urls == ["https://example.com/feed1.xml", "https://example.com/feed2.xml"]


def test_parse_opml_with_grouped_feeds() -> None:
    opml = """<?xml version="1.0"?>
    <opml version="2.0">
        <body>
            <outline text="News">
                <outline text="Feed One" xmlUrl="https://example.com/feed1.xml"/>
                <outline text="Feed Two" xmlUrl="https://example.com/feed2.xml"/>
            </outline>
        </body>
    </opml>
    """

    groups = parse_opml_groups(opml)

    assert len(groups) == 1
    assert groups[0].name == "News"
    assert groups[0].feed_urls == ["https://example.com/feed1.xml", "https://example.com/feed2.xml"]


def test_parse_opml_with_mixed_grouped_and_ungrouped_feeds() -> None:
    opml = """<?xml version="1.0"?>
    <opml version="2.0">
        <body>
            <outline text="News">
                <outline text="Feed One" xmlUrl="https://example.com/feed1.xml"/>
            </outline>
            <outline text="Standalone Feed" xmlUrl="https://example.com/feed2.xml"/>
        </body>
    </opml>
    """

    groups = parse_opml_groups(opml)

    assert len(groups) == 2
    assert groups[0].name == "News"
    assert groups[0].feed_urls == ["https://example.com/feed1.xml"]
    assert groups[1].name is None
    assert groups[1].feed_urls == ["https://example.com/feed2.xml"]


def test_parse_opml_uses_title_attribute_when_text_is_missing() -> None:
    opml = """<?xml version="1.0"?>
    <opml version="2.0">
        <body>
            <outline title="News">
                <outline xmlUrl="https://example.com/feed1.xml"/>
            </outline>
        </body>
    </opml>
    """

    groups = parse_opml_groups(opml)

    assert groups[0].name == "News"


def test_parse_opml_skips_outline_without_xml_url() -> None:
    opml = """<?xml version="1.0"?>
    <opml version="2.0">
        <body>
            <outline text="Not a feed"/>
        </body>
    </opml>
    """

    groups = parse_opml_groups(opml)

    assert groups == []


def test_parse_opml_with_empty_body() -> None:
    opml = """<?xml version="1.0"?>
    <opml version="2.0">
        <body/>
    </opml>
    """

    groups = parse_opml_groups(opml)

    assert groups == []


def test_parse_opml_with_malformed_xml_raises_error() -> None:
    with pytest.raises(InvalidOpmlFileError):
        parse_opml_groups("<opml><body><outline></body></opml>")


def test_parse_opml_without_body_raises_error() -> None:
    with pytest.raises(InvalidOpmlFileError):
        parse_opml_groups("<opml></opml>")
