from django import forms
from .dataset_models import Cottages
class CottagesForm(forms.ModelForm):
    class Meta:
        model = Cottages
        fields = '__all__'
