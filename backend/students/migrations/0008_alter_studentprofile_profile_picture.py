# Generated manually - change profile_picture from ImageField to TextField

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0007_create_admin'),
    ]

    operations = [
        migrations.AlterField(
            model_name='studentprofile',
            name='profile_picture',
            field=models.TextField(blank=True, null=True),
        ),
    ]
