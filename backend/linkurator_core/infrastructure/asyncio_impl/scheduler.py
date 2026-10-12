import asyncio
import logging
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Awaitable, Callable

TaskCallback = Callable[[], Awaitable[None]]


@dataclass
class Task:
    id: uuid.UUID
    interval_seconds: float
    callback: TaskCallback
    latest_executed: datetime
    skip_first: bool = False
    timeout_seconds: float | None = None


class TaskScheduler:
    """Run recurring tasks concurrently, with at most one execution of each task at a time."""

    def __init__(self) -> None:
        self.tasks: list[Task] = []
        self.is_running = False
        self._stopped = asyncio.Event()

    def schedule_recurring_task(
            self,
            task: TaskCallback,
            interval_seconds: float,
            skip_first: bool = False,
            timeout_seconds: float | None = None,
    ) -> None:
        """Schedule an independent recurring task, with an optional execution timeout."""
        if interval_seconds <= 0:
            msg = "Task intervals must be positive"
            raise ValueError(msg)
        if timeout_seconds is not None and timeout_seconds <= 0:
            msg = "Task timeout must be positive"
            raise ValueError(msg)
        self.tasks.append(Task(
            id=uuid.uuid4(),
            interval_seconds=interval_seconds,
            callback=task,
            latest_executed=datetime.fromtimestamp(0, timezone.utc),
            skip_first=skip_first,
            timeout_seconds=timeout_seconds,
        ))

    async def _run_task(self, task: Task) -> None:
        if task.skip_first:
            await asyncio.sleep(task.interval_seconds)
        while self.is_running:
            started = asyncio.get_running_loop().time()
            task.latest_executed = datetime.now(timezone.utc)
            try:
                if task.timeout_seconds is None:
                    await task.callback()
                else:
                    await asyncio.wait_for(task.callback(), timeout=task.timeout_seconds)
            except Exception:
                logging.exception("Scheduled task %s failed", task.callback)
                delay = task.interval_seconds
            else:
                elapsed = asyncio.get_running_loop().time() - started
                delay = max(0, task.interval_seconds - elapsed)
            await asyncio.sleep(delay)

    async def start(self) -> None:
        self.is_running = True
        self._stopped.clear()
        running = [asyncio.create_task(self._run_task(task)) for task in self.tasks]
        try:
            await self._stopped.wait()
        finally:
            self.is_running = False
            for task in running:
                task.cancel()
            await asyncio.gather(*running, return_exceptions=True)

    async def stop(self) -> None:
        self.is_running = False
        self._stopped.set()
