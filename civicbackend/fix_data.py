import os
import django

# 🔥 SET DJANGO SETTINGS
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "civic_backend.settings")
django.setup()

# ✅ NOW IMPORT MODELS
from complaints.models import Complaint, Department

# ✅ YOUR MAPPING
mapping = {
    "streetlight": "Street Light",
    "trash_bins": "Garbage",
    "potholes": "Potholes",
    "water_leakage": "Water Leakage"
}

print("🔍 Checking complaints...\n")

for c in Complaint.objects.all():
    pred = c.predicted_class
    dept = c.department

    print(f"ID: {c.id} | Predicted: {pred} | Department: {dept}")

print("\n🔧 Fixing missing departments...\n")

# 🔥 FIX DATA
for c in Complaint.objects.all():
    key = c.predicted_class.strip().lower()
    dept_name = mapping.get(key)

    if dept_name:
        try:
            dept = Department.objects.get(name=dept_name)
            c.department = dept
            c.save()
            print(f"✅ Fixed: ID {c.id} → {dept_name}")
        except Department.DoesNotExist:
            print(f"❌ Department not found: {dept_name}")
    else:
        print(f"⚠️ Unknown class: {c.predicted_class}")

print("\n🎉 Done!")
