from django.db import models
from core.core_models import SubProject
from django.contrib.auth.models import User
from django import forms


class Dashboard(models.Model):
    dashboard_id = models.AutoField(primary_key=True)
    dashboard_name = models.CharField(max_length=255, default="dashboard")
    is_chart = models.BooleanField(default=False)
    datatables = models.BooleanField(default=False)
    is_default = models.BooleanField(default=False)
    project_id = models.ForeignKey(SubProject, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return self.dashboard_name


class Basket(models.Model):
    basket_name = models.CharField(max_length=255)
    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE)
    includes_filters = models.TextField(blank=True, null=True)
    exclusive_filters = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return self.basket_name


class BasketSelection(models.Model):
    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE)
    basket = models.ForeignKey(Basket, on_delete=models.CASCADE)
    is_selected = models.BooleanField(default=False)


class DataTablesModel(models.Model):
    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE)
    table_header = models.TextField(default="Data Table Columns")

    def __str__(self) -> str:
        return self.table_header


# Create your models here.
