from flask_sqlalchemy import SQLAlchemy
import os
from abc import ABC, abstractmethod
from typing import Optional, Any, Dict

# Global SQLAlchemy instance
db = SQLAlchemy()

class DatabaseInterface(ABC):
    """Base interface for database operations."""
    
    def __init__(self, db_instance: SQLAlchemy):
        self.db = db_instance
    
    @abstractmethod
    def create_tables(self) -> None:
        """Create database tables for this interface."""
        pass
    
    @abstractmethod
    def get_models(self) -> Dict[str, Any]:
        """Return dictionary of models for this interface."""
        pass

class DatabaseManager:
    """Centralized database manager for multiple interfaces."""
    
    def __init__(self):
        self.interfaces: Dict[str, DatabaseInterface] = {}
        self._initialized = False
    
    def register_interface(self, name: str, interface: DatabaseInterface) -> None:
        """Register a database interface."""
        self.interfaces[name] = interface
    
    def get_interface(self, name: str) -> Optional[DatabaseInterface]:
        """Get a registered database interface."""
        return self.interfaces.get(name)
    
    def initialize(self, app) -> None:
        """Initialize database with Flask app."""
        if self._initialized:
            return
            
        database_url = self._get_database_url()
        
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        # Initialize SQLAlchemy only if not already initialized
        if not hasattr(app, 'extensions') or 'sqlalchemy' not in app.extensions:
            db.init_app(app)
        
        # Test database connection
        try:
            with app.app_context():
                self._create_all_tables()
                # Test connection
                db.session.execute(db.text('SELECT 1'))
                print(f"PostgreSQL connected successfully: {database_url[:50]}...")
        except Exception as e:
            print(f"PostgreSQL connection failed: {e}")
            raise e
        
        self._initialized = True
    
    def _get_database_url(self) -> str:
        """Get database URL with GCP Cloud SQL support and local fallback."""
        # Check for direct DATABASE_URL first
        database_url = os.getenv('DATABASE_URL')
        if database_url:
            return database_url
        
        # Check for GCP Cloud SQL environment variables
        gcp_project_id = os.getenv('GCP_PROJECT_ID')
        gcp_region = os.getenv('GCP_REGION')
        gcp_instance = os.getenv('GCP_INSTANCE')
        gcp_db_user = os.getenv('GCP_DB_USER')
        gcp_db_password = os.getenv('GCP_DB_PASSWORD')
        gcp_db_name = os.getenv('GCP_DB_NAME')
        
        # Build Cloud SQL connection string
        if all([gcp_project_id, gcp_region, gcp_instance, gcp_db_user, gcp_db_password, gcp_db_name]):
            return f"postgresql://{gcp_db_user}:{gcp_db_password}@/{gcp_db_name}?host=/cloudsql/{gcp_project_id}:{gcp_region}:{gcp_instance}"
        
        raise ValueError(
            "Database connection not configured. Set either:\n"
            "1. DATABASE_URL environment variable, or\n"
            "2. GCP_PROJECT_ID, GCP_REGION, GCP_INSTANCE, GCP_DB_USER, GCP_DB_PASSWORD, GCP_DB_NAME, or\n"
            "3. CLOUD_SQL_CONNECTION_NAME with DB_USER, DB_PASSWORD, DB_NAME, or\n"
            "4. FLASK_ENV=development for SQLite fallback"
        )
    
    def _create_all_tables(self) -> None:
        """Create all tables from registered interfaces."""
        db.create_all()
        
        # Create tables for each interface
        for interface_name, interface in self.interfaces.items():
            try:
                interface.create_tables()
                print(f"Tables created for {interface_name} interface")
            except Exception as e:
                print(f"Error creating tables for {interface_name}: {e}")

# Global database manager instance
db_manager = DatabaseManager()

def init_database(app):
    """Initialize database with Flask app."""
    return db_manager.initialize(app)
