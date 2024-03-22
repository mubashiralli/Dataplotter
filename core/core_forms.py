from django import forms
from .core_models import SubProject
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm

class SubProjectForm(forms.ModelForm):
    class Meta:
        model = SubProject
        fields = ["project_name"]


class AddUserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["username", "password", "first_name", "last_name"]
