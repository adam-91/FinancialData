import json
import structlog
from datetime import datetime
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, Query
from pydantic import BaseModel

logger = structlog.get_logger()

router = APIRouter(prefix="/api/logs", tags=["logs"])


class LogEntry(BaseModel):
    timestamp: str
    level: str
    logger_name: str
    event: str
    extra: dict


class LogsResponse(BaseModel):
    logs: list[LogEntry]
    total: int
    page: int
    page_size: int


@router.get("", response_model=LogsResponse)
async def get_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    level: str | None = None,
    module: str | None = None,
    search: str | None = None,
    sort_order: Literal["asc", "desc"] = "desc",
):
    valid_levels = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
    if level and level.upper() not in valid_levels:
        level = None
    log_file = Path("logs/app.log")

    if not log_file.exists():
        logger.warning("Log file not found", path=str(log_file))
        return LogsResponse(logs=[], total=0, page=page, page_size=page_size)

    all_logs = []

    try:
        with open(log_file, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue

                try:
                    log_data = json.loads(line)
                    all_logs.append(log_data)
                except json.JSONDecodeError:
                    logger.debug("Failed to parse log line", line=line[:100])
                    continue
    except Exception as e:
        logger.error("Error reading log file", error=str(e))
        return LogsResponse(logs=[], total=0, page=page, page_size=page_size)

    filtered_logs = all_logs

    if level:
        level_upper = level.upper()
        filtered_logs = [
            log for log in filtered_logs if log.get("level", "").upper() == level_upper
        ]
    if module:
        filtered_logs = [
            log
            for log in filtered_logs
            if log.get("logger", "").endswith(module)
        ]
    if search:
        search_lower = search.lower()
        filtered_logs = [
            log for log in filtered_logs if search_lower in log.get("event", "").lower()
        ]

    def get_timestamp(log):
        ts = log.get("timestamp", "")
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=datetime.now().astimezone().tzinfo)
            return dt
        except (ValueError, AttributeError):
            return datetime.min.replace(tzinfo=datetime.now().astimezone().tzinfo)

    filtered_logs.sort(key=get_timestamp, reverse=(sort_order == "desc"))

    total = len(filtered_logs)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_logs = filtered_logs[start_idx:end_idx]

    log_entries = []
    for log in page_logs:
        extra = {
            k: v
            for k, v in log.items()
            if k not in ("timestamp", "level", "logger", "event")
        }

        log_entries.append(
            LogEntry(
                timestamp=log.get("timestamp", ""),
                level=log.get("level", "INFO"),
                logger_name=log.get("logger", ""),
                event=log.get("event", ""),
                extra=extra,
            )
        )

    return LogsResponse(logs=log_entries, total=total, page=page, page_size=page_size)
