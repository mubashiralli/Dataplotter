from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .dash_models import Dashboard, DataTablesModel, Basket
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from .dash_services import *
import json
from charts.chart_services import return_filters


# Create your views here.
@login_required(login_url="login")
def default_dashboard(request, did):
    if request.method == "GET":
        project_id = request.GET.get("project_id")
        dashboards = Dashboard.objects.filter(
            is_default=True, project_id_id=project_id
        ).exclude(dashboard_id=did)
        for dashboard in dashboards:
            dashboard.is_default = False
            dashboard.save()
        dashboard = Dashboard.objects.get(dashboard_id=did)
        dashboard.is_default = True
        dashboard.save()
        response = {"name": dashboard.dashboard_name, "default": dashboard.is_default}
        return JsonResponse(response)


@login_required(login_url="login")
def if_features_exist(request, id):
    dashboards = list(Dashboard.objects.filter(dashboard_id=id).values())
    return JsonResponse(
        {"result": dashboards, "user": request.user.username, "dashboard_id": id}
    )


# id must belongs to the dataset such as Norton (subproject)
def get_datatables_header(request, id):
    project_models = find_request_model(id=id)
    if len(project_models) > 0:
        model_fields = [field.name for field in project_models[0]._meta.get_fields()][
            1:-1
        ]
    else:
        model_fields = []
    return JsonResponse(
        {"fields": model_fields, "user": request.user.username, "project_id": id}
    )

    # return date


# id must belongs to the dataset such as Norton (subproject)
# @login_required(login_url="login")
@csrf_exempt
def get_datatables(request, id):
    body = json.loads(request.body)
    dashboard_id = body.get("dashboard_id")
    draw = int(body.get("draw", 1))
    per_page = int(body.get("length", 10))
    pagno = int(body.get("start", 1))
    pagno = compute_page(pagno=pagno, per_page=per_page)
    column_index = body.get("order", [{}])[0].get("column", 0)
    order = body.get("order", [{}])[0].get("dir", 0)
    search_values = [body.get("SearchData").get(key) for key in body.get("SearchData")]
    basket_id = body.get("basket")
    if basket_id:
        basket_object = Basket.objects.get(id=basket_id)
        filters = return_filters(json.loads(basket_object.includes_filters))
        exuclude = return_filters(json.loads(basket_object.exclusive_filters))
    else:
        filters = body.get("Filters", [{}])
        filters = return_filters(filters)
        exuclude = return_filters([{}])
    project_models = find_request_model(id)
    fields = DataTablesModel.objects.get(dashboard_id=dashboard_id).table_header.split(
        ","
    )
    if len(project_models) > 0:
        model = project_models[0]
        model_fields = {
            field.name: field.get_internal_type()
            for field in project_models[0]._meta.get_fields()[1:-1]
            if field.name in fields
        }
        search_values = [body.get("SearchData").get(key) for key in model_fields]
        model_fields_list = list(model_fields.keys())
        generated_query = get_search_values(
            search_values=search_values, fields=model_fields, id=id
        )
        selected_field = model_fields_list[column_index]
        if order != "asc":
            selected_field = "-" + selected_field
        if generated_query:
            data = (
                model.objects.filter(filters, ~exuclude)
                .filter(generated_query)
                .order_by(selected_field)
                .values(*model_fields_list)
            )
            total_count = data.count()
        else:
            data = (
                model.objects.filter(dataset_id_id=id)
                .order_by(selected_field)
                .values(*model_fields_list)
            )
            total_count = get_count(
                {"model": model, "request": request, "sub_project": id}
            )
        paginator = Paginator(data, per_page)
        page = paginator.get_page(pagno)
        data = list(page.object_list)
        response = {
            "draw": draw,
            "page": pagno,
            "iTotalRecords": total_count,
            "iTotalDisplayRecords": total_count,
            "data": data,
        }
    else:
        response = {"response": 400}
    return JsonResponse(response)


####BACKUP
# @login_required(login_url="login")
# def get_datatables(request, id):
#     draw = int(request.GET.get("draw", 1))
#     per_page = int(request.GET.get("length", 10))
#     pagno = int(request.GET.get("start", 1))
#     pagno = compute_page(pagno=pagno, per_page=per_page)
#     column_index = int(request.GET.get("order[0][column]", 0))
#     order = request.GET.get("order[0][dir]", "asc")
#     project_models = find_request_model(id)
#     if len(project_models) > 0:
#         model = project_models[0]
#         model_fields = {
#             field.name: field.get_internal_type()
#             for field in project_models[0]._meta.get_fields()[1:-1]
#         }

#         model_fields_list = list(model_fields.keys())
#         generated_query = get_search_values(request=request, fields=model_fields, id=id)
#         selected_field = model_fields_list[column_index]
#         if order != "asc":
#             selected_field = "-" + selected_field
#         if generated_query:
#             data = (
#                 model.objects.filter(generated_query)
#                 .order_by(selected_field)
#                 .values(*model_fields_list)
#             )
#             total_count = data.count()
#         else:
#             data = (
#                 model.objects.filter(dataset_id_id=id)
#                 .order_by(selected_field)
#                 .values(*model_fields_list)
#             )
#             total_count = get_count(
#                 {"model": model, "request": request, "sub_project": id}
#             )
#         paginator = Paginator(data, per_page)
#         page = paginator.get_page(pagno)
#         data = list(page.object_list)
#         response = {
#             "draw": draw,
#             "page": pagno,
#             "iTotalRecords": total_count,
#             "iTotalDisplayRecords": total_count,
#             "data": data,
#         }
#     else:
#         response = {"response": 400}
#     return JsonResponse(response)
