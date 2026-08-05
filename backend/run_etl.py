"""
ETL Pipeline runner script.
Run this from the backend directory to execute the ETL pipeline.
"""

import sys
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

# Add backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.etl import ETLPipeline  # noqa: E402


def main():
    """Run the ETL pipeline."""
    print("Starting ETL Pipeline...")

    # Initialize pipeline
    pipeline = ETLPipeline()

    # Run pipeline with options
    results = pipeline.run(
        truncate=True,  # Truncate tables before loading to ensure clean state
        skip_validation=False,  # Set to True to skip validation
        skip_load=False,  # Set to True to skip database loading
    )

    # Print results
    print("\n=== Pipeline Results ===")
    for stage, result in results.items():
        print(f"{stage}: {result}")

    return results


if __name__ == "__main__":
    main()
