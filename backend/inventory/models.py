from django.db import models
from students.models import Student
from complaints.models import Complaint

class InventoryItem(models.Model):
    CATEGORY_CHOICES = (
        ("Electricity", "Electricity"),
        ("Plumbing", "Plumbing"),
        ("Furniture", "Furniture"),
        ("Cleaning", "Cleaning"),
        ("Water", "Water"),
        ("Internet", "Internet"),
        ("Food", "Food / Mess"),
        ("Other", "Other"),
    )

    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="Other")
    total_quantity = models.PositiveIntegerField(default=0)
    available_quantity = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=50, default="pcs")  # e.g. pcs, meters, liters
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.category} - {self.available_quantity} {self.unit})"

class InventoryLog(models.Model):
    ACTION_CHOICES = (
        ("ADDED", "Stock Added"),
        ("USED", "Stock Used"),
        ("REMOVED", "Stock Removed (Damaged/Lost)"),
    )

    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name="logs")
    user = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, blank=True)
    quantity_changed = models.IntegerField()
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    related_complaint = models.ForeignKey(Complaint, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} {self.quantity_changed} {self.item.name}"
