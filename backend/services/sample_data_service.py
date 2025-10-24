"""
Sample Data Generation Service
Generates realistic test data based on schema
"""

from typing import Dict, Any, List
import random
import string
from datetime import datetime, timedelta


class SampleDataGenerator:
    """Generates sample data for testing databases"""

    def __init__(self):
        # Sample data pools
        self.first_names = [
            "John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Emma",
            "James", "Olivia", "William", "Sophia", "Richard", "Isabella", "Thomas", "Mia"
        ]
        self.last_names = [
            "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
            "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas"
        ]
        self.cities = [
            "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
            "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville"
        ]
        self.streets = [
            "Main Street", "Oak Avenue", "Maple Drive", "Cedar Lane", "Elm Road",
            "Park Boulevard", "Washington Street", "First Avenue", "Second Street"
        ]
        self.book_titles = [
            "The Great Adventure", "Mystery of the Lake", "Digital Dreams", "Ancient Wisdom",
            "Modern Times", "The Last Journey", "Secret Garden", "Silent Night", "Brave Heart"
        ]
        self.companies = [
            "TechCorp", "InnoSoft", "DataSystems", "CloudNet", "SmartSolutions",
            "GlobalTech", "FutureLabs", "DigitalWorks", "WebServices"
        ]

    def generate_sample_data(
        self,
        metamodel: Dict[str, Any],
        rows_per_table: int = 10,
        format: str = "sql"
    ) -> str:
        """
        Generate sample data for all entities

        Args:
            metamodel: Database metamodel
            rows_per_table: Number of rows to generate per table
            format: Output format ("sql" or "json")

        Returns:
            Sample data as SQL INSERT statements or JSON
        """
        entities = metamodel.get("entities", [])

        if format == "sql":
            return self._generate_sql_inserts(entities, rows_per_table)
        elif format == "json":
            return self._generate_json_data(entities, rows_per_table)
        else:
            raise ValueError(f"Unsupported format: {format}")

    def _generate_sql_inserts(self, entities: List[Dict], rows_per_table: int) -> str:
        """Generate SQL INSERT statements"""
        sql_statements = []
        sql_statements.append("-- Sample Data")
        sql_statements.append("-- Generated automatically for testing purposes\n")

        for entity in entities:
            entity_name = entity["name"]
            attributes = entity.get("attributes", [])

            sql_statements.append(f"\n-- Insert data into {entity_name}")

            for i in range(rows_per_table):
                values = []
                for attr in attributes:
                    if attr.get("is_primary_key"):
                        # Skip auto-increment primary keys
                        continue
                    value = self._generate_value(attr, entity_name, i + 1)
                    values.append(value)

                # Build column list (excluding auto-increment PKs)
                columns = [
                    attr["name"] for attr in attributes
                    if not attr.get("is_primary_key")
                ]

                if columns and values:
                    columns_str = ", ".join(columns)
                    values_str = ", ".join(str(v) for v in values)
                    sql_statements.append(
                        f"INSERT INTO {entity_name} ({columns_str}) VALUES ({values_str});"
                    )

        return "\n".join(sql_statements)

    def _generate_json_data(self, entities: List[Dict], rows_per_table: int) -> dict:
        """Generate JSON data"""
        data = {}

        for entity in entities:
            entity_name = entity["name"]
            attributes = entity.get("attributes", [])
            rows = []

            for i in range(rows_per_table):
                row = {}
                for attr in attributes:
                    row[attr["name"]] = self._generate_value(attr, entity_name, i + 1, quote=False)
                rows.append(row)

            data[entity_name] = rows

        return data

    def _generate_value(self, attr: Dict, entity_name: str, row_num: int, quote: bool = True) -> Any:
        """Generate a single value based on attribute properties"""
        attr_name = attr["name"].lower()
        data_type = attr.get("data_type", "VARCHAR")

        # Handle primary keys
        if attr.get("is_primary_key"):
            return row_num

        # Handle foreign keys
        if attr.get("is_foreign_key"):
            # Generate a random FK value between 1 and 10
            fk_value = random.randint(1, min(10, row_num))
            return fk_value

        # Generate based on column name patterns
        if "email" in attr_name:
            email = f"user{row_num}@example.com"
            return f"'{email}'" if quote else email

        elif "password" in attr_name or "passwd" in attr_name:
            # Generate a hashed-looking password
            hash_val = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
            return f"'{hash_val}'" if quote else hash_val

        elif "phone" in attr_name or "tel" in attr_name:
            phone = f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
            return f"'{phone}'" if quote else phone

        elif "address" in attr_name or "street" in attr_name:
            num = random.randint(1, 9999)
            street = random.choice(self.streets)
            address = f"{num} {street}"
            return f"'{address}'" if quote else address

        elif "city" in attr_name:
            city = random.choice(self.cities)
            return f"'{city}'" if quote else city

        elif "zip" in attr_name or "postal" in attr_name:
            zip_code = f"{random.randint(10000, 99999)}"
            return f"'{zip_code}'" if quote else zip_code

        elif "name" in attr_name:
            if "first" in attr_name:
                name = random.choice(self.first_names)
            elif "last" in attr_name:
                name = random.choice(self.last_names)
            elif "full" in attr_name:
                name = f"{random.choice(self.first_names)} {random.choice(self.last_names)}"
            elif "company" in attr_name:
                name = random.choice(self.companies)
            else:
                name = random.choice(self.first_names + self.last_names)
            return f"'{name}'" if quote else name

        elif "title" in attr_name:
            title = random.choice(self.book_titles)
            return f"'{title}'" if quote else title

        elif "author" in attr_name:
            author = f"{random.choice(self.first_names)} {random.choice(self.last_names)}"
            return f"'{author}'" if quote else author

        elif "description" in attr_name or "content" in attr_name or "bio" in attr_name:
            desc = f"This is a sample description for {entity_name} number {row_num}."
            return f"'{desc}'" if quote else desc

        elif "created" in attr_name or "updated" in attr_name or "date" in attr_name:
            # Generate date/timestamp
            days_ago = random.randint(1, 365)
            date = datetime.now() - timedelta(days=days_ago)

            if data_type in ["DATE"]:
                date_str = date.strftime("%Y-%m-%d")
            elif data_type in ["TIMESTAMP", "DATETIME"]:
                date_str = date.strftime("%Y-%m-%d %H:%M:%S")
            elif data_type in ["TIME"]:
                date_str = date.strftime("%H:%M:%S")
            else:
                date_str = date.strftime("%Y-%m-%d")

            return f"'{date_str}'" if quote else date_str

        elif "price" in attr_name or "amount" in attr_name or "cost" in attr_name:
            price = round(random.uniform(10.0, 999.99), 2)
            return price

        elif "quantity" in attr_name or "count" in attr_name or "number" in attr_name:
            quantity = random.randint(1, 100)
            return quantity

        elif "age" in attr_name:
            age = random.randint(18, 80)
            return age

        elif "rating" in attr_name or "score" in attr_name:
            rating = round(random.uniform(1.0, 5.0), 1)
            return rating

        elif "url" in attr_name or "website" in attr_name:
            url = f"https://example{row_num}.com"
            return f"'{url}'" if quote else url

        # Default generation based on data type
        elif data_type in ["INTEGER", "BIGINT", "INT"]:
            return random.randint(1, 1000)

        elif data_type in ["DECIMAL", "FLOAT", "DOUBLE", "REAL"]:
            return round(random.uniform(1.0, 1000.0), 2)

        elif data_type in ["BOOLEAN", "BOOL"]:
            return random.choice(["TRUE", "FALSE"])

        elif data_type in ["VARCHAR", "CHAR", "TEXT"]:
            text = f"Sample text {row_num}"
            return f"'{text}'" if quote else text

        elif data_type == "JSON":
            json_data = f'{{"key": "value{row_num}"}}'
            return f"'{json_data}'" if quote else json_data

        else:
            # Default string
            default = f"value_{row_num}"
            return f"'{default}'" if quote else default
