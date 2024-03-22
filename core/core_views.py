from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views import View
from django.utils.decorators import method_decorator
from core.core_models import *
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password
from django.contrib import messages
from django.contrib.auth.models import User
from dashboard.dash_models import Dashboard
from core.coredecorators import all_projects, restricted_view
from .core_forms import SubProjectForm, AddUserForm
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core import serializers
import json

DATE_FORMAT = "%b %d, %Y"


class HomeView(View):
    @method_decorator(login_required(login_url="login"))
    @method_decorator(all_projects)
    def get(self, request, allowed_projects):
        if allowed_projects:
            dash_id = allowed_projects[-1].get("default")
            project_id = Dashboard.objects.filter(dashboard_id=dash_id)
            if project_id:
                project_id = project_id[0].project_id_id
            else:
                project_id = None
        else:
            dash_id = None
            project_id = None
        context = {
            "title": request.user.username.title,
            "dashID": dash_id,
            "pid": project_id,
        }
        return render(request, "core/home.html", context)


class AllUsersView(APIView):
    @method_decorator(restricted_view)
    def get(self, request):
        users = User.objects.all().exclude(is_staff=True)
        all_groups = list(Group.objects.all().values())
        groups = []
        for user in users:
            groups.append(
                ", ".join(list(user.groups.all().values_list("name", flat=True)))
            )
        users = list(users.values())
        for num, user in enumerate(users):
            user["projects"] = groups[num]
        context = {"users": users, "groups": all_groups}
        return render(request, "core/user.html", context=context)

    @method_decorator(restricted_view)
    def post(self, request):
        """
        {
            "username":"mubashirali",
            "password":"demo123456678",
            "first_name":"Mubashir","last_name":"Ali",
            "groups":[
                "OpenXchange",
                "BWW"
            ]
            }
        """
        data = request.data
        form = AddUserForm(data)
        if form.is_valid():
            user = form.save(commit=False)
            user.password = make_password(form.cleaned_data['password'])
            user.save()
            for group in data.get("groups"):
                user.groups.add(Group.objects.get(name=group))
            response = {"status": 200, "username": user.username, "user_id": user.id}
        else:
            response = {"status": None, "form": form.errors}
        return Response(response)
    @method_decorator(restricted_view)
    def put(self, request, pk):
        user = User.objects.get(id=pk)
        data = request.data
        print(f'\n\nthe data is {data}')
        form = AddUserForm(data=data, instance=user)
        if form.is_valid():
            user = form.save(commit=False)
            user.password = make_password(form.cleaned_data['password'])
            user.groups.clear()
            for group in data.get("groups"):
                user.groups.add(Group.objects.get(name=group))
            user.save()
            response = {
                "status": 200,
                "username": user.username,
                "groups": list(user.groups.all().values_list("name")),
            }
        else:
            response = {"status": None, "errors": form.errors}
        return Response(response)
    @method_decorator(restricted_view)
    def delete(self, request, pk):
        user = User.objects.get(id=pk)
        username = user.username
        user.delete()
        response = {"status": 200, "username": username}
        return Response(response)


class AddProject(View):
    @method_decorator(restricted_view)
    def get(self, request):
        return JsonResponse({"workig": 200})

    @method_decorator(restricted_view)
    def post(self, request):
        form = SubProjectForm(json.loads(request.body.decode("utf-8")))
        if form.is_valid():
            subproject_instance = form.save()
            response = {"success": True, "pid": subproject_instance.project_id}
        else:
            response = {"success": False, "errors": form.errors}
        return JsonResponse(response)
