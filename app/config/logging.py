"""Logging configuration for Benky-Fy"""

import os
from typing import Dict, Any

def get_logging_config() -> Dict[str, Any]:
    """Get logging configuration based on environment"""
    
    base_config = {
        'LOG_DIR': os.environ.get('LOG_DIR', 'logs'),
        'LOG_MAX_SIZE_MB': int(os.environ.get('LOG_MAX_SIZE_MB', 100)),
        'LOG_BACKUP_COUNT': int(os.environ.get('LOG_BACKUP_COUNT', 10)),
        'LOG_RETENTION_DAYS': int(os.environ.get('LOG_RETENTION_DAYS', 30)),
        'LOG_LEVEL': os.environ.get('LOG_LEVEL', 'INFO'),
        'LOG_FORMAT': {
            'timestamp': '%(timestamp)s',
            'service_name': '%(service_name)s',
            'environment': '%(environment)s',
            'level': '%(levelname)s',
            'trace_id': '%(trace_id)s',
            'correlation_id': '%(correlation_id)s',
            'category': '%(name)s',
            'message': '%(message)s'
        }
    }
    
    # Environment-specific configurations
    env = os.environ.get('FLASK_ENV', 'development')
    
    if env == 'development':
        base_config.update({
            'LOG_LEVEL': os.environ.get('LOG_LEVEL', 'DEBUG'),
            'LOG_TO_CONSOLE': True,
            'LOG_TO_FILE': True
        })
    
    elif env == 'testing':
        base_config.update({
            'LOG_LEVEL': 'DEBUG',
            'LOG_TO_CONSOLE': True,
            'LOG_TO_FILE': False,
            'LOG_DIR': 'logs/test'
        })
    
    elif env == 'production':
        base_config.update({
            'LOG_LEVEL': 'INFO',
            'LOG_TO_CONSOLE': False,
            'LOG_TO_FILE': True,
            'LOG_MAX_SIZE_MB': 500,  # Larger files for production
            'LOG_BACKUP_COUNT': 30,   # Keep more backups
            'LOG_RETENTION_DAYS': 90  # Longer retention
        })
    
    return base_config

# Log level mapping
LOG_LEVELS = {
    'DEBUG': {
        'description': 'Detailed information for debugging and development',
        'examples': [
            'Function entry/exit',
            'Variable values',
            'SQL queries'
        ]
    },
    'INFO': {
        'description': 'Normal operational events',
        'examples': [
            'Request handling',
            'Task completion',
            'State changes'
        ]
    },
    'WARNING': {
        'description': 'Unexpected events that don\'t affect core functionality',
        'examples': [
            'Deprecated feature usage',
            'Resource running low',
            'Slow operations'
        ]
    },
    'ERROR': {
        'description': 'Errors that affect functionality but don\'t crash the system',
        'examples': [
            'API errors',
            'Database connection issues',
            'Invalid user input'
        ]
    },
    'CRITICAL': {
        'description': 'Severe errors that might lead to system failure',
        'examples': [
            'Database unavailable',
            'Out of disk space',
            'Critical security issues'
        ]
    }
}

# Category configurations
LOG_CATEGORIES = {
    'system': {
        'description': 'Core system events',
        'retention_days': 90,
        'max_size_mb': 200
    },
    'auth': {
        'description': 'Authentication and authorization events',
        'retention_days': 90,
        'max_size_mb': 150
    },
    'api': {
        'description': 'API request/response logging',
        'retention_days': 30,
        'max_size_mb': 300
    },
    'performance': {
        'description': 'Performance metrics and monitoring',
        'retention_days': 14,
        'max_size_mb': 200
    },
    'user_action': {
        'description': 'User interaction logging',
        'retention_days': 30,
        'max_size_mb': 250
    },
    'security': {
        'description': 'Security-related events',
        'retention_days': 90,
        'max_size_mb': 150
    }
}
