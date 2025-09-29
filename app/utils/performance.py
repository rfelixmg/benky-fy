import time
import psutil
import functools
from typing import Callable, Any, Optional, Dict
from flask import request, g
from .logger import logger

def monitor_performance(operation_name: str = None):
    """Decorator to monitor endpoint performance with detailed metrics
    
    Args:
        operation_name: Optional name for the operation. If not provided,
                       uses the function name.
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            start_memory = psutil.Process().memory_info().rss / 1024 / 1024  # MB
            start_cpu = psutil.cpu_percent()
            
            try:
                # Execute the function
                result = func(*args, **kwargs)
                
                # Calculate metrics
                duration_ms = (time.time() - start_time) * 1000
                memory_used = (psutil.Process().memory_info().rss / 1024 / 1024) - start_memory
                cpu_used = psutil.cpu_percent() - start_cpu
                
                # Log performance metrics
                metrics = {
                    'memory_mb': round(memory_used, 2),
                    'cpu_percent': round(cpu_used, 2),
                    'duration_ms': round(duration_ms, 2)
                }
                
                # Add request queue info if available
                if hasattr(request, '_queue_start_time'):
                    queue_time = (start_time - request._queue_start_time) * 1000
                    metrics['queue_time_ms'] = round(queue_time, 2)
                
                logger.log_performance(
                    operation=operation_name or func.__name__,
                    duration_ms=duration_ms,
                    context=metrics
                )
                
                return result
                
            except Exception as e:
                # Still log performance on errors
                duration_ms = (time.time() - start_time) * 1000
                memory_used = (psutil.Process().memory_info().rss / 1024 / 1024) - start_memory
                cpu_used = psutil.cpu_percent() - start_cpu
                
                metrics = {
                    'memory_mb': round(memory_used, 2),
                    'cpu_percent': round(cpu_used, 2),
                    'duration_ms': round(duration_ms, 2),
                    'error': str(e)
                }
                
                logger.log_performance(
                    operation=operation_name or func.__name__,
                    duration_ms=duration_ms,
                    context=metrics
                )
                raise
                
        return wrapper
    return decorator

def monitor_slow_operations(threshold_ms: float = 1000.0):
    """Decorator to monitor and log slow operations
    
    Args:
        threshold_ms: Time threshold in milliseconds. Operations taking longer
                     than this will be logged as slow operations.
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            
            try:
                result = func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                
                if duration_ms > threshold_ms:
                    logger.log_performance(
                        operation=f"SLOW_OPERATION:{func.__name__}",
                        duration_ms=duration_ms,
                        context={
                            'threshold_ms': threshold_ms,
                            'args': str(args),
                            'kwargs': str(kwargs)
                        }
                    )
                
                return result
                
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                logger.log_performance(
                    operation=f"ERROR:{func.__name__}",
                    duration_ms=duration_ms,
                    context={
                        'error': str(e),
                        'args': str(args),
                        'kwargs': str(kwargs)
                    }
                )
                raise
                
        return wrapper
    return decorator

def track_database_performance():
    """Decorator to track database query performance"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            
            try:
                result = func(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                
                # Log database operation performance
                logger.log_performance(
                    operation=f"DB:{func.__name__}",
                    duration_ms=duration_ms,
                    context={
                        'query_type': func.__name__,
                        'args': str(args),
                        'result_size': len(result) if hasattr(result, '__len__') else 1
                    }
                )
                
                return result
                
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                logger.log_performance(
                    operation=f"DB_ERROR:{func.__name__}",
                    duration_ms=duration_ms,
                    context={
                        'error': str(e),
                        'query_type': func.__name__,
                        'args': str(args)
                    }
                )
                raise
                
        return wrapper
    return decorator