"""Minimal in-process metrics service.

This provides a very small abstraction for counters and gauges. For production,
replace or extend with Prometheus client or another monitoring backend.
"""

from typing import Dict


class MetricsService:
	def __init__(self):
		self._counters: Dict[str, int] = {}
		self._gauges: Dict[str, float] = {}

	def inc_counter(self, name: str, amount: int = 1) -> None:
		self._counters[name] = self._counters.get(name, 0) + amount

	def set_gauge(self, name: str, value: float) -> None:
		self._gauges[name] = float(value)

	def get_metrics(self) -> Dict[str, Dict]:
		return {
			"counters": dict(self._counters),
			"gauges": dict(self._gauges),
		}


# Singleton instance for simple import-and-use
metrics = MetricsService()

