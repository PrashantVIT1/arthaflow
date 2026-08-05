"""ETL Pipeline orchestrator."""

from typing import Dict

from app.etl.clean import Cleaner
from app.etl.config import ETLConfig
from app.etl.extract import Extractor
from app.etl.load import Loader
from app.etl.transform import Transformer
from app.etl.validate import Validator


class ETLPipeline:
    """ETL Pipeline orchestrator."""

    def __init__(self, config: ETLConfig = None):
        """Initialize pipeline with configuration."""
        self.config = config or ETLConfig()
        self.extractor = Extractor(self.config)
        self.validator = Validator(self.config)
        self.cleaner = Cleaner(self.config)
        self.transformer = Transformer(self.config)
        self.loader = Loader(self.config)

    def run(
        self,
        truncate: bool = False,
        skip_validation: bool = False,
        skip_load: bool = False,
    ) -> Dict:
        """
        Run the complete ETL pipeline.

        Args:
            truncate: Whether to truncate tables before loading
            skip_validation: Whether to skip validation step
            skip_load: Whether to skip loading step

        Returns:
            Dictionary with pipeline results
        """
        results = {
            "extract": {},
            "validate": {},
            "clean": {},
            "transform": {},
            "load": {},
        }

        print("=" * 50)
        print("Starting ETL Pipeline")
        print("=" * 50)

        # Extract
        print("\n--- EXTRACT ---")
        try:
            extracted_data = self.extractor.extract_all()
            results["extract"]["success"] = True
            results["extract"]["rows"] = {
                table: len(df) for table, df in extracted_data.items()
            }
        except Exception as e:
            results["extract"]["success"] = False
            results["extract"]["error"] = str(e)
            print(f"Extract failed: {e}")
            return results

        # Validate
        print("\n--- VALIDATE ---")
        if not skip_validation:
            validation_results = self.validator.validate_all(extracted_data)
            results["validate"]["results"] = validation_results

            all_valid = all(
                result[0] for result in validation_results.values()
            )
            results["validate"]["all_valid"] = all_valid

            if not all_valid:
                print("Validation failed. Errors:")
                for table, (is_valid, errors) in validation_results.items():
                    if not is_valid:
                        print(f"  {table}: {errors}")
                return results
            else:
                print("All data validated successfully")
        else:
            print("Skipping validation")

        # Clean
        print("\n--- CLEAN ---")
        try:
            cleaned_data = self.cleaner.clean_all(extracted_data)
            results["clean"]["success"] = True
            results["clean"]["rows"] = {
                table: len(df) for table, df in cleaned_data.items()
            }
        except Exception as e:
            results["clean"]["success"] = False
            results["clean"]["error"] = str(e)
            print(f"Clean failed: {e}")
            return results

        # Transform
        print("\n--- TRANSFORM ---")
        try:
            transformed_data = self.transformer.transform_all(cleaned_data)
            results["transform"]["success"] = True
            results["transform"]["rows"] = {
                table: len(df) for table, df in transformed_data.items()
            }
        except Exception as e:
            results["transform"]["success"] = False
            results["transform"]["error"] = str(e)
            print(f"Transform failed: {e}")
            return results

        # Load
        print("\n--- LOAD ---")
        if not skip_load:
            try:
                load_results = self.loader.load_all(
                    transformed_data, truncate=truncate
                )
                results["load"]["success"] = True
                results["load"]["rows"] = load_results
            except Exception as e:
                results["load"]["success"] = False
                results["load"]["error"] = str(e)
                print(f"Load failed: {e}")
                return results
        else:
            print("Skipping load")

        print("\n" + "=" * 50)
        print("ETL Pipeline completed successfully!")
        print("=" * 50)

        return results

    def run_extract_only(self) -> Dict[str, object]:
        """Run only the extract step."""
        return self.extractor.extract_all()

    def run_validate_only(self, data: Dict) -> Dict:
        """Run only the validate step."""
        return self.validator.validate_all(data)

    def run_clean_only(self, data: Dict) -> Dict:
        """Run only the clean step."""
        return self.cleaner.clean_all(data)

    def run_transform_only(self, data: Dict) -> Dict:
        """Run only the transform step."""
        return self.transformer.transform_all(data)

    def run_load_only(self, data: Dict, truncate: bool = False) -> Dict:
        """Run only the load step."""
        return self.loader.load_all(data, truncate=truncate)
