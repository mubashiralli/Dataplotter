from django.http import HttpResponse
from .core_models import Project, SubProject
from dashboard.dash_models import Dashboard
from django.shortcuts import redirect


def restricted_view(view_func):
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated:
            groups = request.user.groups.all().values_list("name", flat=True)
            if "admin" in groups:
                return view_func(request, *args, **kwargs)
            else:
                return HttpResponse("<h1> Forbidden </h1>", status=403)
        else:
            return redirect("login")

    return wrapper


def find_dashboards(allowed_projects, status=False):
    ids_projects = []
    allowed_projects = list(allowed_projects)
    for project in allowed_projects:
        pid = project["project_id"]
        dashboards = Dashboard.objects.filter(project_id_id=pid).values()
        ids_projects.append(pid)
        if len(dashboards) > 0:
            project["Dashboard"] = list(dashboards)
    if status:
        ids_projects = [
            proj.get("project_id")
            for proj in SubProject.objects.all().values("project_id")
        ]
    dashboards = Dashboard.objects.filter(
        project_id_id__in=ids_projects, is_default=True
    ).values()
    if len(dashboards) > 0:
        default_id = dashboards[0].get("dashboard_id")
        allowed_projects.append({"default": default_id})
    else:
        {"default": None}
    return allowed_projects


def validate_arguments(arguments=[]):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            for arg in arguments:
                if arg not in request.GET.keys():
                    return HttpResponse(f"{arg} is missing")
                elif request.GET.get(arg) == None or request.GET.get(arg) == "":
                    return HttpResponse(f"No value is specified for {arg} ")
            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator


def all_projects(view_function):
    def wrapper(request, *args, **kwargs):
        if request.user.groups.exists():
            valid_groups = request.user.groups.all().values()
            groups_names = [group["name"] for group in valid_groups]
            if "admin" in groups_names:
                allowed_projects = SubProject.objects.all().values()

                allowed_projects = find_dashboards(allowed_projects, True)

                return view_function(
                    request, allowed_projects=allowed_projects, *args, **kwargs
                )

            else:
                group_ids = [group["id"] for group in valid_groups]
                ## generically returns subprojects against different groups
                projects = [
                    project.project_id
                    for project in Project.objects.filter(managed_by__in=group_ids)
                ]
                # print(f"User_groups {group_ids}\nProjects in Else: {projects}")
                allowed_projects = SubProject.objects.filter(
                    parent__in=projects
                ).values()
                allowed_projects = find_dashboards(allowed_projects)

                return view_function(
                    request, allowed_projects=allowed_projects, *args, **kwargs
                )
        else:
            return view_function(request, allowed_projects=None, *args, **kwargs)

    return wrapper
