"""
SQL Validation Service
Validates SQL syntax using sqlparse
"""

import sqlparse
from typing import Dict, Any, List


class SQLValidator:
    """Service for validating SQL syntax"""

    def validate_sql(self, sql_script: str, dbms: str = "postgresql") -> Dict[str, Any]:
        """
        Validate SQL syntax

        Phase 1 Implementation

        Returns:
            {
                "is_valid": bool,
                "errors": List[str],
                "warnings": List[str],
                "parsed_statements": int
            }
        """
        errors = []
        warnings = []

        try:
            # Parse SQL
            parsed = sqlparse.parse(sql_script)
            statement_count = len([s for s in parsed if s.get_type() != 'UNKNOWN'])

            # Basic validation
            if statement_count == 0:
                errors.append("No valid SQL statements found")

            # Check for common issues
            warnings.extend(self._check_best_practices(sql_script))

            return {
                "is_valid": len(errors) == 0,
                "errors": errors,
                "warnings": warnings,
                "parsed_statements": statement_count
            }
        except Exception as e:
            return {
                "is_valid": False,
                "errors": [f"SQL parsing error: {str(e)}"],
                "warnings": [],
                "parsed_statements": 0
            }

    def format_sql(self, sql_script: str) -> str:
        """
        Format SQL script for readability

        Phase 1 Implementation
        """
        return sqlparse.format(
            sql_script,
            reindent=True,
            keyword_case='upper'
        )

    def _check_syntax_errors(self, parsed: sqlparse.sql.Statement) -> List[str]:
        """Check for syntax errors in parsed SQL"""
        # sqlparse is permissive, detailed syntax checking would require database-specific parser
        return []

    def _check_best_practices(self, sql_script: str) -> List[str]:
        """Check for SQL best practice violations"""
        warnings = []
        # Simple checks
        if "SELECT *" in sql_script.upper():
            warnings.append("Consider specifying column names instead of SELECT *")
        return warnings
