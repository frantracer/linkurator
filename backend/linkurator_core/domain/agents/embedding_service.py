from abc import ABC, abstractmethod


class EmbeddingService(ABC):
    @abstractmethod
    async def embed_documents(self, documents: list[str]) -> list[list[float] | None]:
        """Return one vector per document, in order. A document that could not be embedded yields None."""

    @abstractmethod
    async def embed_query(self, query: str) -> list[float]:
        pass

    @abstractmethod
    def related_similarity_threshold(self) -> float:
        """Similarity from which two embedded texts are considered to be about the same concept"""
