from django import forms
from .dash_models import *


class DashForms(forms.ModelForm):
    class Meta:
        model = Dashboard
        fields = [
            "dashboard_name",
            # 'datatables'
            "is_default",
            "project_id",
        ]


class DashUpdateForms(forms.ModelForm):
    class Meta:
        model = Dashboard
        fields = [
            "dashboard_name",
            # # 'datatables'
            "is_default",
            # "project_id",
        ]


class BasketForm(forms.ModelForm):
    class Meta:
        model = Basket
        fields = [
            "basket_name",
            "dashboard",
            "includes_filters",
            "exclusive_filters",
            # "is_selected",
            "created_by",
        ]


class BasketSelectionForm(forms.ModelForm):
    class Meta:
        model = BasketSelection
        fields = [
            "dashboard",
            "basket",
            "is_selected",
        ]

    # def clean(self):
    #     cleaned_data = super().clean()
    #     dashboard = cleaned_data.get("dashboard")
    #     is_selected = cleaned_data.get("is_selected")
    #     if (
    #         is_selected
    #         and Basket.objects.filter(dashboard=dashboard, is_selected=True)
    #         .exclude(pk=self.instance.pk)
    #         .exists()
    #     ):
    #         raise forms.ValidationError(
    #             "Only one selected basket is allowed per dashboard."
    #         )
    #     return cleaned_data


class DataTableForms(forms.ModelForm):
    class Meta:
        model = DataTablesModel
        fields = ["dashboard", "table_header"]
