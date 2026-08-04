<div align="center">
  <img src="frontend/public/assets/logo/logo-full.svg" alt="ArthaFlow Logo" width="200" height="40">
</div>

# ArthaFlow

ArthaFlow is an Enterprise ETL & Business Analytics Platform for importing, transforming, analyzing, and visualizing business data through interactive dashboards and automated data pipelines.

Transforming Data into Business Value

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Pandas

### Frontend
- React
- Vite
- TypeScript
- TailwindCSS
- D3.js
- Axios

## Project Structure

```
insightflow/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── services/     # Business logic
│   │   ├── repositories/ # Data access layer
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas (DTOs)
│   │   ├── database/     # Database configuration
│   │   ├── etl/          # ETL pipelines
│   │   └── utils/        # Utility functions
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/   # Reusable components
    │   ├── pages/        # Page components
    │   ├── charts/       # D3.js chart components
    │   ├── services/     # API service layer
    │   ├── hooks/        # Custom React hooks
    │   └── utils/        # Utility functions
    ├── package.json
    └── .env.example
```

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. Initialize Alembic (for database migrations):
```bash
alembic init alembic
```

6. Run the development server from the backend directory:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Alternatively, from the project root:
```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Architecture

The project follows clean architecture principles:

- **API Layer**: FastAPI routes handle HTTP requests
- **Service Layer**: Business logic and orchestration
- **Repository Layer**: Data access and database operations
- **Models**: SQLAlchemy ORM models
- **Schemas**: Pydantic schemas for request/response validation

## Database Schema

### Entity-Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    customers    │       │     orders      │       │    products     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ id (PK)         │───────►│ id (PK)         │
│ name            │       │ order_number    │       │ name            │
│ email           │       │ customer_id (FK)│       │ description     │
│ phone           │       │ product_id (FK) │       │ category        │
│ address         │       │ quantity        │       │ price           │
│ city            │       │ unit_price      │       │ cost            │
│ country         │       │ total_amount    │       │ stock_quantity  │
│ created_at      │       │ order_date      │       │ created_at      │
│ updated_at      │       │ status          │       │ updated_at      │
└─────────────────┘       │ region          │       └─────────────────┘
                          │ created_at      │
                          │ updated_at      │
                          └─────────────────┘

Relationships:
- customers (1) ───< orders (N)
- products (1) ───< orders (N)
```

### Table Details

**customers**
- Stores customer information
- Indexed on: id, email (unique)
- Relationships: One-to-many with orders

**products**
- Stores product catalog
- Indexed on: id, category
- Relationships: One-to-many with orders

**orders**
- Stores order transactions
- Indexed on: id, order_number (unique), customer_id, product_id, order_date, region
- Foreign keys: customer_id → customers.id, product_id → products.id
- Relationships: Many-to-one with customers and products

### Database Migrations

To apply database migrations:
```bash
cd backend
alembic upgrade head
```

To create a new migration:
```bash
alembic revision --autogenerate -m "description"
```

### Seed Data

To populate the database with sample data:
```bash
cd backend
python seed_data.py
```

This will create:
- 10 customers
- 15 products across 4 categories (Electronics, Clothing, Home, Furniture)
- 50 orders with random dates within the last 6 months

## ETL Pipeline

The ETL (Extract, Transform, Load) pipeline processes CSV data and loads it into PostgreSQL.

### Pipeline Stages

1. **Extract**: Read CSV files (orders.csv, customers.csv, products.csv)
2. **Validate**: Check data quality, required columns, data types, null values, duplicates
3. **Clean**: Remove duplicates, handle null values, convert dates
4. **Transform**: Calculate revenue, calculate profit, merge datasets, add derived columns
5. **Load**: Load transformed data into PostgreSQL tables

### Running the ETL Pipeline

Create a Python script to run the pipeline:

```python
from app.etl import ETLPipeline

# Initialize pipeline
pipeline = ETLPipeline()

# Run complete pipeline
results = pipeline.run(truncate=False)

# Run with options
results = pipeline.run(
    truncate=True,        # Truncate tables before loading
    skip_validation=False, # Skip validation step
    skip_load=False       # Skip loading step
)
```

Or run individual stages:

```python
from app.etl import Extractor, Validator, Cleaner, Transformer, Loader

# Extract
extractor = Extractor()
data = extractor.extract_all()

# Validate
validator = Validator()
validation_results = validator.validate_all(data)

# Clean
cleaner = Cleaner()
cleaned_data = cleaner.clean_all(data)

# Transform
transformer = Transformer()
transformed_data = transformer.transform_all(cleaned_data)

# Load
loader = Loader()
load_results = loader.load_all(transformed_data, truncate=True)
```

### Input Data Format

Place CSV files in `backend/data/` directory:

**customers.csv**
```
id,name,email,phone,address,city,country
1,John Smith,john@example.com,+1-555-0101,123 Main St,New York,USA
```

**products.csv**
```
id,name,description,category,price,cost,stock_quantity
1,Laptop Pro,High-performance laptop,Electronics,1299.99,800.00,50
```

**orders.csv**
```
id,order_number,customer_id,product_id,quantity,unit_price,order_date,status,region
1001,ORD-1000,1,1,2,1299.99,2024-01-15,completed,North
```

### Transformations Applied

- **Revenue Calculation**: `total_amount = quantity * unit_price`
- **Profit Calculation**: `profit = (unit_price - cost) * quantity`
- **Dataset Merging**: Orders merged with customers and products
- **Derived Columns**: order_year, order_month, order_month_name, profit_margin

### ETL Modules

- `config.py`: Configuration and validation rules
- `extract.py`: CSV file reading
- `validate.py`: Data quality checks
- `clean.py`: Data cleaning and preprocessing
- `transform.py`: Business logic and calculations
- `load.py`: PostgreSQL data loading
- `pipeline.py`: Pipeline orchestration

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)

### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:8000)

## Development Guidelines

- Follow SOLID principles
- Use async FastAPI endpoints where appropriate
- Keep business logic out of API routes
- Never hardcode credentials
- Use type hints and docstrings
- Prefer reusable, modular components
- No duplicated logic
- Keep functions under 50 lines where practical
