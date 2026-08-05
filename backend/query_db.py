"""
Simple script to run SQL queries against the database.
"""

import sys
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

# Get database URL
DATABASE_URL = Path(__file__).resolve().parent / ".env"


def run_query(query):
    """Run SQL query and return results."""
    from app.database.config import get_engine

    engine = get_engine()

    try:
        df = pd.read_sql(query, engine)
        print(df.to_string(index=False))
        return df
    except Exception as e:
        print(f"Error: {e}")
        return None


if __name__ == "__main__":
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = "SELECT COUNT(*) FROM orders;"

    run_query(query)
