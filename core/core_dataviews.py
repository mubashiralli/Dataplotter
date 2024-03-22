from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from .coredecorators import all_projects
from django.http import JsonResponse
from datetime import datetime
from .core_models import *
from .coredecorators import validate_arguments
from django.views.decorators.csrf import csrf_exempt
import json


def testview(request):
    return render(
        request,
        "file.html",
    )


def get_ip(request):
    client_ip = request.META.get("REMOTE_ADDR")
    if client_ip is None:
        client_ip = request.META.get('HTTP_X_FORWARDED_FOR')
    return JsonResponse({"ip": client_ip,'meta':list(request.META.get('REMOTE_ADDR'))})


@login_required(login_url="login")
@all_projects
def get_sidebar(request, allowed_projects):
    if allowed_projects == None:
        allowed_projects = []
    return JsonResponse({"projects": list(allowed_projects)})

@login_required(login_url="login")
def view_roles(request):
    groups = request.user.groups.all().values_list("name", flat=True)
    if "viewer" in groups:
        response = {"status": True}
    else:
        response = {"status": False}
    return JsonResponse(response)


@login_required(login_url="login")
def adminOnly(request):
    groups = request.user.groups.all().values_list("name", flat=True)
    response = {"status": True} if "admin" in groups else  {"status": False}
    return JsonResponse(response)
