import os
import django
import sys

# Setup Django Environment
sys.path.append('c:/Users/nidhi/StayEase-Madona/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stayease_backend.settings')
django.setup()

from inventory.models import InventoryItem

def seed_inventory():
    items = [
        {"name": "LED Bulb (9W)", "total_quantity": 100, "unit": "pcs", "category": "Electricity"},
        {"name": "Tube Light", "total_quantity": 50, "unit": "pcs", "category": "Electricity"},
        {"name": "Tap Spindle", "total_quantity": 30, "unit": "pcs", "category": "Plumbing"},
        {"name": "Teflon Tape", "total_quantity": 20, "unit": "rolls", "category": "Plumbing"},
        {"name": "Fan Capacitor", "total_quantity": 40, "unit": "pcs", "category": "Electricity"},
        {"name": "Door Hinge", "total_quantity": 25, "unit": "pcs", "category": "Furniture"},
        {"name": "Broom", "total_quantity": 15, "unit": "pcs", "category": "Cleaning"},
        {"name": "Floor Cleaner", "total_quantity": 20, "unit": "bottles", "category": "Cleaning"},
    ]

    print("Seeding Inventory...")
    for item_data in items:
        item, created = InventoryItem.objects.get_or_create(
            name=item_data["name"],
            defaults={
                "total_quantity": item_data["total_quantity"],
                "available_quantity": item_data["total_quantity"],
                "unit": item_data["unit"],
                "category": item_data["category"]
            }
        )
        if created:
            print(f"Created: {item.name}")
        else:
            print(f"Already exists: {item.name}")

    print("Seeding Complete!")

if __name__ == "__main__":
    seed_inventory()
