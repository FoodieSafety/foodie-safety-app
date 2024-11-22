from backend.utils.common_logging import create_logs

@create_logs(log_to_file=True, log_dir="test_logs")
def test_write_log(logger=None):
    logger.info("Start executing loop.")
    res = [i for i in range(100_000_000)]
    logger.info("Loop ends.")
    return res
