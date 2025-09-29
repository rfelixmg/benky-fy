# Benky-Fy Logging System Documentation

## Overview

The Benky-Fy logging system is a comprehensive solution for application logging, featuring structured logging, performance monitoring, security features, and efficient log management. The system is designed to provide detailed insights into application behavior while maintaining security and performance.

## Core Components

### 1. Logger (`logger.py`)

The central logging component that provides:
- Structured JSON logging with standardized fields
- Category-based logging (system, auth, api, performance, user_action, security)
- Request context enrichment
- Correlation and tracing support

```python
from app.utils.logger import logger

# Authentication logging
logger.log_auth('login', success=True, details={'ip': '127.0.0.1'})

# API error logging
logger.log_api_error('/api/users', error, context={'query': 'params'})

# Performance logging
logger.log_performance('database_query', duration_ms=150.5)

# Security event logging
logger.log_security('suspicious_activity', 'high', {'attempts': 5})
```

### 2. Performance Monitoring (`performance.py`)

Provides decorators and utilities for monitoring application performance:

```python
from app.utils.performance import monitor_performance, monitor_slow_operations

@monitor_performance('user_registration')
def register_user():
    # Function implementation

@monitor_slow_operations(threshold_ms=1000.0)
def database_operation():
    # Function implementation
```

Features:
- CPU and memory usage tracking
- Request queue monitoring
- Slow operation detection
- Database query performance tracking

### 3. Error Handling (`error_handler.py`)

Comprehensive error handling and logging:

```python
from app.utils.error_handler import handle_errors

@handle_errors([ValueError, TypeError])
def process_data():
    # Function implementation
```

Features:
- Detailed error context capture
- Stack trace logging
- Request context inclusion
- PII data redaction in error messages

### 4. Security Features (`security.py`)

Data protection and security logging:

```python
from app.utils.security import mask_sensitive_data, audit_data_access

@mask_sensitive_data()
def process_user_data(user_info):
    # Function implementation

@audit_data_access('user_data')
def get_user_profile():
    # Function implementation
```

Features:
- PII data masking
- Sensitive data redaction
- Access auditing
- Security event logging

### 5. Log Management (`log_manager.py`)

Handles log file organization and maintenance:

```python
from app.utils.log_manager import LogManager

log_manager = LogManager(
    base_dir='logs',
    max_size_mb=100,
    backup_count=10,
    retention_days=30
)
```

Features:
- Automatic log rotation
- Compression of rotated logs
- Retention policy enforcement
- Directory structure management

## Configuration

### Environment Variables

- `FLASK_ENV`: Environment name (development, staging, production)
- `FLASK_SECRET_KEY`: Application secret key
- `LOG_DIR`: Base directory for logs
- `LOG_MAX_SIZE_MB`: Maximum log file size
- `LOG_BACKUP_COUNT`: Number of backup files to keep
- `LOG_RETENTION_DAYS`: Days to retain log files

### Log Levels

- `ERROR`: System errors requiring immediate attention
- `WARNING`: Potential issues that don't affect core functionality
- `INFO`: Normal operational events
- `DEBUG`: Detailed information for troubleshooting

### Log Categories

1. **System**
   - Core system events
   - Configuration changes
   - Startup/shutdown events

2. **Auth**
   - Authentication attempts
   - Authorization checks
   - Session management

3. **API**
   - Request/response logging
   - API errors
   - Rate limiting events

4. **Performance**
   - Response times
   - Resource usage
   - Slow operations

5. **User Action**
   - User interactions
   - Feature usage
   - User preferences

6. **Security**
   - Security events
   - Access attempts
   - Data protection

## Log Directory Structure

```
logs/
├── system/
│   ├── error.log
│   ├── info.log
│   └── debug.log
├── auth/
│   ├── error.log
│   ├── info.log
│   └── debug.log
├── api/
│   ├── error.log
│   ├── info.log
│   └── debug.log
├── performance/
│   ├── error.log
│   ├── info.log
│   └── debug.log
├── user_action/
│   ├── error.log
│   ├── info.log
│   └── debug.log
└── security/
    ├── error.log
    ├── info.log
    └── debug.log
```

## Best Practices

1. **Log Level Selection**
   - Use ERROR for system failures
   - Use WARNING for recoverable issues
   - Use INFO for normal operations
   - Use DEBUG for detailed troubleshooting

2. **Sensitive Data**
   - Never log passwords or secrets
   - Use data masking for PII
   - Implement proper access controls
   - Regular audit of logged data

3. **Performance Considerations**
   - Monitor log file sizes
   - Use appropriate log levels
   - Implement log rotation
   - Regular cleanup of old logs

4. **Security**
   - Secure log file permissions
   - Encrypt sensitive log data
   - Regular security audits
   - Access control implementation

## Testing

The logging system includes comprehensive tests:

```bash
# Run all tests
pytest tests/

# Run specific test categories
pytest tests/test_logger.py
pytest tests/test_performance.py
pytest tests/test_error_handler.py
pytest tests/test_security.py
pytest tests/test_log_manager.py
```

## Maintenance

1. **Log Rotation**
   - Automatic rotation based on size
   - Compression of rotated files
   - Retention policy enforcement

2. **Monitoring**
   - Regular check of log sizes
   - Audit of security events
   - Performance impact assessment

3. **Cleanup**
   - Automatic removal of old logs
   - Compression of archived logs
   - Directory structure maintenance

## Troubleshooting

1. **Common Issues**
   - Log file permissions
   - Disk space management
   - Performance impact
   - Security concerns

2. **Debug Mode**
   - Enable debug logging
   - Monitor performance metrics
   - Check error contexts

3. **Support**
   - System documentation
   - Error message guide
   - Configuration reference
