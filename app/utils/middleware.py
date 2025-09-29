import time
from flask import request, g
from typing import Callable
from functools import wraps

def log_request_middleware() -> Callable:
    """Middleware to capture request/response data for logging"""
    def middleware(f: Callable) -> Callable:
        @wraps(f)
        def decorated(*args, **kwargs):
            # Start timer
            start_time = time.time()
            
            try:
                # Execute request
                response = f(*args, **kwargs)
                
                # Calculate response time
                duration_ms = (time.time() - start_time) * 1000
                
                # Store response data on request object for logging
                setattr(request, '_response_time', duration_ms)
                if isinstance(response, tuple):
                    setattr(request, '_response_status', response[1])
                else:
                    setattr(request, '_response_status', response.status_code)
                return response
                
            except Exception as e:
                # Still capture timing and status for errors
                duration_ms = (time.time() - start_time) * 1000
                setattr(request, '_response_time', duration_ms)
                setattr(request, '_response_status', 500)  # Internal Server Error
                raise
                
        return decorated
    return middleware
