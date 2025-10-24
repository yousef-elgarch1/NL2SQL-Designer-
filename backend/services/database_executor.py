"""
Database Executor Service
Connects to real databases and executes SQL schema creation
"""

from typing import Dict, Any, Optional
import sqlalchemy
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError


class DatabaseExecutor:
    """Service for executing SQL on real databases"""

    def __init__(self):
        self.engines = {}  # Cache database connections

    def create_connection_string(self, config: Dict[str, Any]) -> str:
        """
        Build connection string from configuration

        Args:
            config: Database configuration
                - dbms: Database type (postgresql, mysql, sqlite, sqlserver, oracle)
                - host: Server hostname
                - port: Server port
                - database: Database name
                - username: Database username
                - password: Database password
                - Additional options per database type

        Returns:
            SQLAlchemy connection string
        """
        dbms = config.get("dbms", "postgresql")

        if dbms == "sqlite":
            # SQLite uses file path
            db_path = config.get("database", "database.db")
            return f"sqlite:///{db_path}"

        # For server-based databases
        host = config.get("host", "localhost")
        port = config.get("port")
        database = config.get("database", "")
        username = config.get("username", "")
        password = config.get("password", "")

        # Default ports
        default_ports = {
            "postgresql": 5432,
            "mysql": 3306,
            "sqlserver": 1433,
            "oracle": 1521
        }

        if not port:
            port = default_ports.get(dbms, 5432)

        # Build connection strings
        if dbms == "postgresql":
            return f"postgresql://{username}:{password}@{host}:{port}/{database}"

        elif dbms == "mysql":
            return f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"

        elif dbms == "sqlserver":
            # SQL Server uses different format
            driver = config.get("driver", "ODBC Driver 17 for SQL Server")
            return f"mssql+pyodbc://{username}:{password}@{host}:{port}/{database}?driver={driver}"

        elif dbms == "oracle":
            # Oracle format
            return f"oracle+cx_oracle://{username}:{password}@{host}:{port}/{database}"

        else:
            raise ValueError(f"Unsupported database type: {dbms}")

    def test_connection(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Test database connection

        Returns:
            {
                "success": bool,
                "message": str,
                "details": dict (optional)
            }
        """
        try:
            # For MySQL and PostgreSQL, test connection without specifying database
            # This allows testing even if the database doesn't exist yet
            test_config = config.copy()
            dbms = config.get("dbms")

            if dbms == "mysql":
                # Connect to MySQL server without database
                test_config["database"] = ""
            elif dbms == "postgresql":
                # Connect to default postgres database
                test_config["database"] = "postgres"
            elif dbms == "sqlserver":
                # Connect to master database
                test_config["database"] = "master"

            connection_string = self.create_connection_string(test_config)
            engine = create_engine(connection_string, echo=False)

            # Try to connect
            with engine.connect() as conn:
                # Execute a simple query to verify connection
                result = conn.execute(text("SELECT 1"))
                result.fetchone()

            return {
                "success": True,
                "message": "Connection successful! Server is reachable.",
                "details": {
                    "dbms": config.get("dbms"),
                    "host": config.get("host"),
                    "database": config.get("database")
                }
            }

        except SQLAlchemyError as e:
            return {
                "success": False,
                "message": f"Connection failed: {str(e)}",
                "error": str(e)
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Unexpected error: {str(e)}",
                "error": str(e)
            }

    def execute_sql(
        self,
        config: Dict[str, Any],
        sql_script: str,
        create_database: bool = False
    ) -> Dict[str, Any]:
        """
        Execute SQL script on database

        Args:
            config: Database configuration
            sql_script: SQL script to execute
            create_database: If True, create database first (if it doesn't exist)

        Returns:
            {
                "success": bool,
                "message": str,
                "tables_created": list,
                "errors": list (optional)
            }
        """
        try:
            # Create database first if requested
            if create_database and config.get("dbms") != "sqlite":
                self._create_database_if_not_exists(config)

            # Connect and execute
            connection_string = self.create_connection_string(config)
            engine = create_engine(connection_string, echo=False)

            tables_created = []
            errors = []

            with engine.connect() as conn:
                # Split SQL script into individual statements
                statements = self._split_sql_statements(sql_script)

                for i, statement in enumerate(statements):
                    statement = statement.strip()
                    if not statement or statement.startswith("--"):
                        continue

                    try:
                        # Execute statement
                        conn.execute(text(statement))
                        conn.commit()

                        # Track table creation
                        if "CREATE TABLE" in statement.upper():
                            table_name = self._extract_table_name(statement)
                            if table_name:
                                tables_created.append(table_name)

                    except SQLAlchemyError as e:
                        errors.append({
                            "statement": statement[:100],
                            "error": str(e)
                        })

            if errors:
                return {
                    "success": False,
                    "message": f"Partial success: {len(tables_created)} tables created, {len(errors)} errors",
                    "tables_created": tables_created,
                    "errors": errors
                }
            else:
                return {
                    "success": True,
                    "message": f"Schema created successfully! {len(tables_created)} tables created.",
                    "tables_created": tables_created
                }

        except Exception as e:
            return {
                "success": False,
                "message": f"Execution failed: {str(e)}",
                "error": str(e)
            }

    def _create_database_if_not_exists(self, config: Dict[str, Any]):
        """Create database if it doesn't exist"""
        dbms = config.get("dbms")
        database_name = config.get("database")

        # Connect to default database
        temp_config = config.copy()

        if dbms == "postgresql":
            temp_config["database"] = "postgres"
        elif dbms == "mysql":
            temp_config["database"] = ""
        elif dbms == "sqlserver":
            temp_config["database"] = "master"
        elif dbms == "oracle":
            # Oracle doesn't work this way
            return

        connection_string = self.create_connection_string(temp_config)
        engine = create_engine(connection_string, echo=False, isolation_level="AUTOCOMMIT")

        try:
            with engine.connect() as conn:
                # Check if database exists
                if dbms == "postgresql":
                    result = conn.execute(
                        text(f"SELECT 1 FROM pg_database WHERE datname = '{database_name}'")
                    )
                    if not result.fetchone():
                        conn.execute(text(f"CREATE DATABASE {database_name}"))

                elif dbms == "mysql":
                    conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {database_name}"))

                elif dbms == "sqlserver":
                    result = conn.execute(
                        text(f"SELECT 1 FROM sys.databases WHERE name = '{database_name}'")
                    )
                    if not result.fetchone():
                        conn.execute(text(f"CREATE DATABASE {database_name}"))

        except Exception as e:
            print(f"Database creation error: {e}")
            # Continue anyway - database might already exist

    def _split_sql_statements(self, sql_script: str) -> list:
        """Split SQL script into individual statements"""
        # Simple split by semicolon (not perfect but works for most cases)
        statements = []
        current = []

        for line in sql_script.split("\n"):
            line = line.strip()
            if not line or line.startswith("--"):
                continue

            current.append(line)

            if line.endswith(";"):
                statements.append("\n".join(current))
                current = []

        if current:
            statements.append("\n".join(current))

        return statements

    def _extract_table_name(self, create_statement: str) -> Optional[str]:
        """Extract table name from CREATE TABLE statement"""
        try:
            # Remove CREATE TABLE and get table name
            parts = create_statement.upper().split("CREATE TABLE")
            if len(parts) > 1:
                table_part = parts[1].strip()
                # Get first word (table name)
                table_name = table_part.split()[0].strip('"`[]')
                return table_name
        except:
            pass
        return None

    def get_database_info(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get information about existing database

        Returns table names, row counts, etc.
        """
        try:
            connection_string = self.create_connection_string(config)
            engine = create_engine(connection_string, echo=False)

            tables = []

            with engine.connect() as conn:
                # Get table names (database-specific queries)
                dbms = config.get("dbms")

                if dbms == "postgresql":
                    result = conn.execute(text(
                        "SELECT table_name FROM information_schema.tables "
                        "WHERE table_schema = 'public'"
                    ))
                elif dbms == "mysql":
                    result = conn.execute(text("SHOW TABLES"))
                elif dbms == "sqlite":
                    result = conn.execute(text(
                        "SELECT name FROM sqlite_master WHERE type='table'"
                    ))
                else:
                    return {"success": False, "message": "Database info not supported for this DBMS"}

                for row in result:
                    tables.append(row[0])

            return {
                "success": True,
                "tables": tables,
                "table_count": len(tables)
            }

        except Exception as e:
            return {
                "success": False,
                "message": str(e)
            }
