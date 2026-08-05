"""
Seed data script for retail analytics platform.
Run this script to populate the database with sample data.
"""

import os

from dotenv import load_dotenv

# Load environment variables BEFORE importing database config
load_dotenv()

# Ensure DATABASE_URL is set
if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = (
        "postgresql://postgres:1234567890@localhost:5432/insightflow"
    )

import random  # noqa: E402
from datetime import datetime, timedelta  # noqa: E402

from app.database.config import SessionLocal  # noqa: E402
from app.models import Customer, Order, Product  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402


def seed_customers(db: Session):
    """Seed customers table with sample data."""
    customers_data = [
        {
            "name": "John Smith",
            "email": "john.smith@example.com",
            "phone": "+1-555-0101",
            "address": "123 Main St",
            "city": "New York",
            "country": "USA",
        },
        {
            "name": "Sarah Johnson",
            "email": "sarah.johnson@example.com",
            "phone": "+1-555-0102",
            "address": "456 Oak Ave",
            "city": "Los Angeles",
            "country": "USA",
        },
        {
            "name": "Michael Brown",
            "email": "michael.brown@example.com",
            "phone": "+1-555-0103",
            "address": "789 Pine Rd",
            "city": "Chicago",
            "country": "USA",
        },
        {
            "name": "Emily Davis",
            "email": "emily.davis@example.com",
            "phone": "+1-555-0104",
            "address": "321 Elm St",
            "city": "Houston",
            "country": "USA",
        },
        {
            "name": "David Wilson",
            "email": "david.wilson@example.com",
            "phone": "+1-555-0105",
            "address": "654 Maple Dr",
            "city": "Phoenix",
            "country": "USA",
        },
        {
            "name": "Emma Martinez",
            "email": "emma.martinez@example.com",
            "phone": "+1-555-0106",
            "address": "987 Cedar Ln",
            "city": "Miami",
            "country": "USA",
        },
        {
            "name": "James Anderson",
            "email": "james.anderson@example.com",
            "phone": "+1-555-0107",
            "address": "147 Birch Blvd",
            "city": "Seattle",
            "country": "USA",
        },
        {
            "name": "Olivia Taylor",
            "email": "olivia.taylor@example.com",
            "phone": "+1-555-0108",
            "address": "258 Spruce Way",
            "city": "Denver",
            "country": "USA",
        },
        {
            "name": "William Thomas",
            "email": "william.thomas@example.com",
            "phone": "+1-555-0109",
            "address": "369 Aspen Ct",
            "city": "Boston",
            "country": "USA",
        },
        {
            "name": "Sophia Garcia",
            "email": "sophia.garcia@example.com",
            "phone": "+1-555-0110",
            "address": "741 Willow Pl",
            "city": "Atlanta",
            "country": "USA",
        },
    ]

    customers = []
    for data in customers_data:
        customer = Customer(**data)
        db.add(customer)
        customers.append(customer)

    db.commit()
    for customer in customers:
        db.refresh(customer)

    print(f"Seeded {len(customers)} customers")
    return customers


def seed_products(db: Session):
    """Seed products table with sample data."""
    products_data = [
        {
            "name": "Laptop Pro 15",
            "description": "High-performance laptop with 15-inch display",
            "category": "Electronics",
            "price": 1299.99,
            "cost": 800.00,
            "stock_quantity": 50,
        },
        {
            "name": "Wireless Mouse",
            "description": "Ergonomic wireless mouse with precision tracking",
            "category": "Electronics",
            "price": 49.99,
            "cost": 15.00,
            "stock_quantity": 200,
        },
        {
            "name": "Mechanical Keyboard",
            "description": "RGB mechanical keyboard with Cherry MX switches",
            "category": "Electronics",
            "price": 149.99,
            "cost": 60.00,
            "stock_quantity": 100,
        },
        {
            "name": "27-inch Monitor",
            "description": "4K UHD monitor with HDR support",
            "category": "Electronics",
            "price": 399.99,
            "cost": 250.00,
            "stock_quantity": 75,
        },
        {
            "name": "USB-C Hub",
            "description": "7-in-1 USB-C hub with HDMI and USB 3.0 ports",
            "category": "Electronics",
            "price": 39.99,
            "cost": 12.00,
            "stock_quantity": 150,
        },
        {
            "name": "Running Shoes",
            "description": "Lightweight running shoes with cushioned sole",
            "category": "Clothing",
            "price": 89.99,
            "cost": 35.00,
            "stock_quantity": 120,
        },
        {
            "name": "Cotton T-Shirt",
            "description": "100% cotton t-shirt, available in multiple colors",
            "category": "Clothing",
            "price": 24.99,
            "cost": 8.00,
            "stock_quantity": 300,
        },
        {
            "name": "Denim Jeans",
            "description": "Classic fit denim jeans with stretch",
            "category": "Clothing",
            "price": 59.99,
            "cost": 22.00,
            "stock_quantity": 200,
        },
        {
            "name": "Winter Jacket",
            "description": "Waterproof winter jacket with insulation",
            "category": "Clothing",
            "price": 149.99,
            "cost": 55.00,
            "stock_quantity": 80,
        },
        {
            "name": "Coffee Maker",
            "description": "Programmable coffee maker with thermal carafe",
            "category": "Home",
            "price": 79.99,
            "cost": 30.00,
            "stock_quantity": 90,
        },
        {
            "name": "Blender",
            "description": "High-speed blender for smoothies and food prep",
            "category": "Home",
            "price": 99.99,
            "cost": 40.00,
            "stock_quantity": 70,
        },
        {
            "name": "Desk Lamp",
            "description": "LED desk lamp with adjustable brightness",
            "category": "Home",
            "price": 34.99,
            "cost": 12.00,
            "stock_quantity": 180,
        },
        {
            "name": "Office Chair",
            "description": "Ergonomic office chair with lumbar support",
            "category": "Furniture",
            "price": 299.99,
            "cost": 120.00,
            "stock_quantity": 40,
        },
        {
            "name": "Bookshelf",
            "description": "5-tier wooden bookshelf",
            "category": "Furniture",
            "price": 149.99,
            "cost": 60.00,
            "stock_quantity": 60,
        },
        {
            "name": "Standing Desk",
            "description": "Adjustable height standing desk",
            "category": "Furniture",
            "price": 499.99,
            "cost": 200.00,
            "stock_quantity": 30,
        },
    ]

    products = []
    for data in products_data:
        product = Product(**data)
        db.add(product)
        products.append(product)

    db.commit()
    for product in products:
        db.refresh(product)

    print(f"Seeded {len(products)} products")
    return products


def seed_orders(db: Session, customers: list, products: list):
    """Seed orders table with sample data."""
    regions = ["North", "South", "East", "West", "Central"]
    statuses = ["completed", "pending", "shipped", "cancelled"]

    orders = []
    order_counter = 1000

    # Generate 50 orders
    for i in range(50):
        customer = random.choice(customers)
        product = random.choice(products)
        quantity = random.randint(1, 5)
        unit_price = product.price
        total_amount = quantity * unit_price

        # Random date within last 6 months
        days_ago = random.randint(0, 180)
        order_date = datetime.now() - timedelta(days=days_ago)

        order = Order(
            order_number=f"ORD-{order_counter + i}",
            customer_id=customer.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=unit_price,
            total_amount=total_amount,
            order_date=order_date,
            status=random.choice(statuses),
            region=random.choice(regions),
        )
        db.add(order)
        orders.append(order)

    db.commit()
    print(f"Seeded {len(orders)} orders")


def seed_all():
    """Seed all tables with sample data."""
    db = SessionLocal()
    try:
        print("Starting database seeding...")

        # Clear existing data
        print("Clearing existing data...")
        db.query(Order).delete()
        db.query(Product).delete()
        db.query(Customer).delete()
        db.commit()

        # Seed data
        customers = seed_customers(db)
        products = seed_products(db)
        seed_orders(db, customers, products)

        print("Database seeding completed successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
