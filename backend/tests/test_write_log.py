from backend.utils.common_logging import log_execution_time

@log_execution_time
def test_write_log():
    res = [i for i in range(100_000_000)]
    return res