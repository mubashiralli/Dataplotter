from django import forms
from .charts_models import *
from rest_framework import serializers


class Create_Charts(forms.ModelForm):
    class Meta:
        model = Charts
        fields = ["name", "chart_type", "js_name", "dashboard", "dimension", "metric"]


class CopyChartsForm(forms.ModelForm):
    class Meta:
        model = Charts
        fields = "__all__"


class Update_charts(serializers.ModelSerializer):
    class Meta:
        model = Charts
        fields = [
            "name",
            "js_name",
            "filters",
            "chart_type",
            "dimension",
            "metric",
            "breakdown",
            "metric_column",
            "sorting",
            "chart_x",
            "chart_y",
            "legend_postion",
            "secondary_sort",
        ]

        def validate_filters(self, value):
            if value is None:
                value = None  # Set the value to None if it's not provided
            # Perform additional validation or modification if needed
            return value



class ValidateFilters(forms.ModelForm):
    class Meta:
        model = Filter
        fields = [
            "filter_column",
            "filter_values",
            "dashboard",
        ]


class UpdateFilterForms(serializers.ModelSerializer):
    class Meta:
        model = Filter
        fields = ["filter_column", "filter_values", "limit"]


class Update_Filter_Unchecked(serializers.ModelSerializer):
    class Meta:
        model = Filter
        fields = ["unchecked_values"]


class ColorsForm(forms.ModelForm):
    class Meta:
        model = ChartColor
        fields = "__all__"
