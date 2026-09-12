import argparse
import asyncio
import logging

from pydantic_ai.usage import RunUsage

from linkurator_core.infrastructure.ai_agents.keyword_generator_agent import KeywordGeneratorAgent
from linkurator_core.infrastructure.ai_agents.model import create_agent_model
from linkurator_core.infrastructure.config.settings import ApplicationSettings


async def main() -> None:
    parser = argparse.ArgumentParser(description="Run the keyword generator agent")
    parser.add_argument("query", help="Query to generate keywords for")
    args = parser.parse_args()

    settings = ApplicationSettings.from_file()

    agent_model = create_agent_model(
        openai_api_key=settings.ai_agent.openai.api_key if settings.ai_agent.openai.enabled else None,
        mistral_api_key=settings.ai_agent.mistral_ai.api_key if settings.ai_agent.mistral_ai.enabled else None,
    )
    if agent_model is None:
        logging.error("No LLM credentials configured; enable openai or mistral_ai under ai_agent in the config file.")
        return

    agent = KeywordGeneratorAgent(
        model=agent_model,
    )
    usage = RunUsage()

    logging.info(f"Generating keywords for query: '{args.query}'")
    logging.info("=" * 50)

    keywords = await agent.generate_keywords(args.query, usage)

    logging.info(f"Generated {len(keywords)} keywords:")
    for i, keyword in enumerate(keywords, 1):
        logging.info(f"{i:2d}. {keyword}")

    logging.info("=" * 50)
    logging.info(f"Usage: {usage}")


if __name__ == "__main__":
    asyncio.run(main())
