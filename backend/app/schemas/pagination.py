"""Schemas for pagination operations."""

from typing import Generic, List, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response schema."""

    items: List[T]
    current_page: int
    page_size: int
    total_elements: int
    total_pages: int
    has_next: bool
    has_previous: bool
    first_page: bool
    last_page: bool

    class Config:
        from_attributes = True
