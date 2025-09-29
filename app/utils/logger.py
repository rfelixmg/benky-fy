import logging

# Create a default logger
logger = logging.getLogger('benky-fy')
logger.setLevel(logging.DEBUG)

# Add console handler if none exists
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter('[%(asctime)s] %(levelname)s: %(message)s'))
    logger.addHandler(handler)