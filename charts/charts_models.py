from django.db import models
from dashboard.dash_models import Dashboard
from core.core_models import SubProject


class Charts(models.Model):
    name = models.CharField(max_length=255, default="Chart")
    js_name = models.CharField(max_length=255, default="barchart")
    filters = models.TextField(
        null=True, blank=True
    )  # (max_length=4096, default=None, null=True)
    chart_type = models.CharField(max_length=255, default="1")
    chart_x = models.TextField(max_length=None)
    chart_y = models.TextField(max_length=None)
    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE)
    dimension = models.CharField(max_length=255, default=None)
    breakdown = models.CharField(max_length=255, default=None, null=True, blank=True)
    metric = models.CharField(max_length=255, default="count")
    metric_column = models.CharField(
        max_length=255, default=None, null=True, blank=True
    )
    sorting = models.CharField(max_length=20, default="ASC")
    secondary_sort = models.CharField(max_length=20, default="ASC")
    legend_postion = models.CharField(max_length=32, default="top")

    def __str__(self) -> str:
        return f"{self.name} - {self.dimension}"


class Filter(models.Model):
    id = models.AutoField(primary_key=True)
    filter_column = models.CharField(max_length=64, default="")
    filter_values = models.TextField()
    limit = models.IntegerField(default=75)
    unchecked_values = models.TextField(blank=True)
    dashboard = models.ForeignKey(Dashboard, on_delete=models.CASCADE)
    updated_at = models.DateField(auto_now=True)

    def __str__(self) -> str:
        return self.filter_column

    class Meta:
        unique_together = ["filter_column", "dashboard"]


# Create your models here.
class ChartColor(models.Model):
    column_name = models.CharField(max_length=64, default="CarMake")
    column_value = models.CharField(max_length=64, default="Ford")
    colour = models.CharField(max_length=64, default="black")
    project = models.ForeignKey(SubProject, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f"{self.column_name} - {self.column_value} {self.colour} - Project = {self.project.project_name}"

    class Meta:
        unique_together = ["column_value", "colour", "column_name", "project"]
