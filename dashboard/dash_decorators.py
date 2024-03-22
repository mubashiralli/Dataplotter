from .dash_models import Dashboard
from django.shortcuts import redirect
from django.http import HttpResponse
from core.core_models import SubProject


def authorized_to(view_func):
    def wrapper(request, id, *args, **kwargs):
        user_groups = request.user.groups.all().values_list("name", flat=True)
        if request.method == "GET":
            dashboard = Dashboard.objects.get(dashboard_id=id)
            group_name = dashboard.project_id.parent.managed_by.name  # ORM
            if "admin" in user_groups:
                return view_func(request, id, *args, **kwargs)
            elif group_name in user_groups:
                return view_func(request, id, *args, **kwargs)
            else:
                return redirect("home")
        elif request.method == "POST":
            subproject = SubProject.objects.get(project_id=id)
            group_name = subproject.parent.managed_by.name
            if "admin" in user_groups:
                return view_func(request, id, *args, **kwargs)
            elif group_name in user_groups:
                return view_func(request, id, *args, **kwargs)
            return HttpResponse(
                "<h1> You are not authorized to add/modify/edit the dashboard</h1>",
                status=403,
            )

    return wrapper
