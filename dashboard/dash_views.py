from django.views import View
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .dash_forms import *
import json
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404, redirect
from .dash_models import Dashboard, DataTablesModel
from rest_framework.views import APIView
from rest_framework.response import Response
from charts.charts_models import Charts, Filter
from charts.charts_form import *
from charts.chart_services import return_filters
from .dash_services import set_none_values
from .dash_services import find_request_model
from .dash_decorators import authorized_to
from django.utils.decorators import method_decorator
from charts.filters_services import process_filters
from django.core.paginator import Paginator


class BasketCreationView(APIView):
    def get(self, request):
        raw_filters = request.GET.get("filters")
        project_id = request.GET.get("project_id")
        requested_col = request.GET.get("filter_column")
        link = request.GET.get("link", True)
        page = request.GET.get("page", 1)
        optional_column = request.GET.get("optional_column")
        if raw_filters:
            last_filter = raw_filters.split("|")[-1].split(":")[0]
            if not optional_column:
                groupvalues = (last_filter, requested_col)
            else:
                groupvalues = (last_filter, requested_col, optional_column)
                # last_filter,requested_col = requested_col,optional_column
            filters = [filter.split(":") for filter in raw_filters.split("|")]
            filters = {filter[0]: filter[1] for filter in filters}
            filters = return_filters([filters])
        else:
            last_filter = None
            groupvalues = (requested_col,)
            filters = return_filters([{}])
        model = find_request_model(project_id)
        query_data = (
            model[0].objects.filter(filters).all().values(*groupvalues).distinct()
        )
        if last_filter:
            processed = ",".join(
                [
                    " - ".join(f"{data.get(x)}" for x in groupvalues)
                    for data in query_data
                ]
            )
        else:
            processed = process_filters(data=query_data, column_name=requested_col)
        per_page = 600
        processed = processed.split(",")
        paginator = Paginator(processed, per_page)
        page = paginator.get_page(page)
        filer_values = list(page.object_list)
        ismore = page.has_next()
        if ismore:
            next_page = page.next_page_number()
        else:
            next_page = None
        response = {
            # "dashboard": id,
            "filter_column": requested_col,
            "filter_values": filer_values,
            "next": next_page,
            "more_pages": ismore,
        }
        return Response(response)


class DataTableView(APIView):
    def get(self, request, pk):  # pk = dashboard id
        data_tables = get_object_or_404(DataTablesModel,dashboard_id = pk)
        header = data_tables.table_header.split(",")
        response =Response({"header": header, "col_id": data_tables.id})
        return response 
    def post(self, request):
        """{
        "dashboard":1,
        "table_header":["col1","col2"]
        }"""
        data = request.data
        data["table_header"] = ",".join(data["table_header"])
        table_form = DataTableForms(data)
        if table_form.is_valid():
            did = data.get("dashboard")
            dashboard_object = Dashboard.objects.get(
                dashboard_id=did
            )  # updating the dashboard datatable created flag to true
            dashboard_object.datatables = True
            dashboard_object.save()
            new_object = table_form.save()
            response = {"status": True, "object": new_object.id}
        else:
            response = {"status": False, "errors": table_form.errors}
        return Response(response)

    def put(self, request, pk):  # object primary key
        """
        {
        "dashboard":1,
        "table_header": ['col','col2']
        }
        """
        instance = DataTablesModel.objects.get(id=pk)
        body = request.data
        body["table_header"] = ",".join(body["table_header"])
        table_form = DataTableForms(instance=instance, data=body)
        if table_form.is_valid():
            table_form.save()
            response = {"status": True, "msg": "updated successfully"}
        else:
            response = {"status": False, "errors": table_form.errors}
        return Response(response)

    def delete(self, request, pk):
        object = DataTablesModel.objects.get(id=pk)
        dashboard = object.dashboard_id
        object.delete()
        dashboard_object = Dashboard.objects.get(dashboard_id=dashboard)
        dashboard_object.datatables = False
        dashboard_object.save()
        return Response({"status": True})


class BasketView(APIView):
    def get(self, request, bid):  # bid == dashbaord_id
        boards = Dashboard.objects.filter(project_id_id=bid).values("dashboard_id")

        baskets = (
            Basket.objects.filter(dashboard_id__in=boards)
            .order_by("basket_name")
            .values()
        )
        for basket in baskets:
            basket["includes_filters"] = json.loads(basket["includes_filters"])
            basket["exclusive_filters"] = json.loads(basket["exclusive_filters"])
        return Response(baskets)

    def post(self, request):
        """
        {
            "basket_name":"Json Basket Test NEW",
            "dashboard":1,
            "includes_filters":[
                {
                    "DateExtractRun":"somedate,somedPate2",
                    "COL2":"Col2values,col2values2"
                }],
            "exclusive_filters":[
                {
                    "DateExtractRun":"exlude,somedate2",
                    "COL2":"exlude,col2values2"
                }],
            "is_selected":false
        }
        """
        data = request.data
        data["includes_filters"] = json.dumps(data["includes_filters"])
        data["exclusive_filters"] = json.dumps(data["exclusive_filters"])
        data["created_by"] = request.user.id
        basket_form = BasketForm(data)

        if basket_form.is_valid():
            basket_form.save()
            response = {
                "saved": True,
                "createdBasket": data.get("basket_name"),
            }
        else:
            response = {"saved": False, "errors": basket_form.errors}
        return Response(response)

    def put(self, request, bid):
        """
        {
            "basket_name":"Json Basket Test NEW",
            "dashboard":1,
            "includes_filters":[
                {
                    "DateExtractRun":"somedate,somedate2",
                    "COL2":"Col2values,col2values2"
                }],
            "exclusive_filters":[
                {
                    "DateExtractRun":"exlude,somedate2",
                    "COL2":"exlude,col2values2"
                }],
        }
        """
        data = request.data
        instance = Basket.objects.get(id=bid)
        data["created_by"] = request.user.id
        data["includes_filters"] = json.dumps(data["includes_filters"])
        data["exclusive_filters"] = json.dumps(data["exclusive_filters"])
        update_form = BasketForm(instance=instance, data=data)
        if update_form.is_valid():
            response = {"update": True}
            update_form.save()
        else:
            response = {"update": False, "errors": update_form.errors}
        return Response(response)

    def delete(self, request, bid):
        basket_response = Basket.objects.get(id=bid).delete()
        return Response({"status": True, "information": basket_response})


class BasketSelectionView(APIView):
    def get(
        self, request, id
    ):  # id belong to dashboard_id to return selected (one or all) Basket
        baskets = BasketSelection.objects.filter(
            dashboard_id=id, is_selected=True
        ).values("basket_id", "is_selected")
        return Response(baskets)

    def put(self, request, id):  # id is irrelevant
        """
        {
            "basket":8,
            "dashboard":1,
            "is_selected":true
        }
        """
        body = request.data
        basket = body.get("basket")
        dashboard = body.get("dashboard")
        instance = BasketSelection.objects.filter(
            dashboard_id=dashboard, basket_id=basket
        )
        if (
            not instance
        ):  # if the record has not been yet created for the request dashboard, then it will be created
            selection_form = BasketSelectionForm(
                {"dashboard": dashboard, "basket": basket, "is_selected": False}
            )
            if selection_form.is_valid():
                instance = (
                    selection_form.save()
                )  # returns the BasketSelection Model Object
                instance = BasketSelection.objects.get(id=instance.id)
        else:
            instance = instance[0]
        all_baskets = BasketSelection.objects.filter(
            dashboard=dashboard, is_selected=True
        )
        for temp_basket in all_baskets:
            temp_basket.is_selected = False
            temp_basket.save()
        update_form = BasketSelectionForm(instance=instance, data=body)
        if update_form.is_valid():
            update_form.save()
        return Response(
            {
                "status": update_form.is_valid(),
                "resource_id": basket,
                "errors": update_form.errors,
            }
        )


class DashboardView(LoginRequiredMixin, View):
    login_url = "/auth/login/"
    redirect_field_name = "next"

    @method_decorator(authorized_to)
    def get(self, request, id):
        found = get_object_or_404(Dashboard, dashboard_id=id)
        if found:
            project_id = Dashboard.objects.get(dashboard_id=id).project_id_id
            return render(
                request, "core/home.html", context={"dashID": id, "pid": project_id}
            )
        else:
            return redirect("home")
    @method_decorator(authorized_to)
    def post(self, request, id):
        body = json.loads(request.body.decode("utf-8"))
        form = {key: body.get(key) for key in body}
        is_default = form.get("is_default")
        if is_default:
            board = Dashboard.objects.filter(is_default=True, project_id_id=id)
            if board:
                board = board[0]
                board.is_default = False
                board.save()
        form = DashForms(form)
        if form.is_valid():
            dash = form.save()
            return JsonResponse({"status": form.is_valid(), "id": dash.dashboard_id})


class DashboardUpdate(LoginRequiredMixin, View):
    login_url = "auth/login/"
    redirect_field_name = "next"

    def post(self, request):  # ?mode=delete
        body = json.loads(request.body)
        did = body.get("did")
        current_dashboard = body.get("current_dashboard")
        # print('')
        dashboard = Dashboard.objects.get(dashboard_id=did)
        # {"did":"58","dashboard_name":"Summary Dashboard","is_default":true}
        if request.GET.get("mode") == "delete":
            project_id = dashboard.project_id_id
            dashboards = Dashboard.objects.filter(project_id_id=project_id).exclude(
                dashboard_id=did
            )
            is_default = dashboard.is_default
            if dashboards:
                dashboard_id = dashboards[0].dashboard_id
                if is_default:
                    dashboards[0].is_default = True
                    dashboards[0].save()
            else:
                dashboard_id = None
            # print(f'\nthe current_dashboard {current_dashboard,did} sameProjectDashID={dashboard_id}\n')
            dashboard.delete()
            if current_dashboard == did:
                if dashboard_id:
                    # print(f'redirecing with arguments = {dashboard_id}')
                    redirect_url = reverse("dashhome", args=[dashboard_id])
                else:
                    redirect_url = reverse("home")
                response = {
                    "status": True,
                    "dashboard_id": did,
                    "redirected_url": redirect_url,
                }
            else:
                response = {"status": True, "dashboard_id": did}

        else:
            update_form = DashUpdateForms(instance=dashboard, data=body)
            print(f"\n\ndata body: {body}\n")
            if update_form.is_valid():
                print(update_form)
                updated_object = update_form.save()
                response = {
                    "updated": True,
                    "dashboard_name": updated_object.dashboard_name,
                    "update_form": update_form.errors,
                }
            else:
                response = {"errors": update_form.errors, "updated": False}
        return JsonResponse(response)


class DashboardCopy(APIView):
    def post(self, request):
        body = request.data
        dashboard_id = body.get("dashboard_id")
        dashboard_name = body.get("dashboard_name")  # new name
        is_default = body.get("is_default")
        pid = body.get("project_id")
        if is_default:
            board = Dashboard.objects.filter(is_default=True, project_id_id=pid)
            if board:
                board = board[0]
                board.is_default = False
                board.save()
        form = DashForms(body)
        errors = []
        if form.is_valid():
            new_board = form.save()
            datatables = DataTablesModel.objects.filter(
                dashboard_id=dashboard_id
            ).values()
            if datatables:
                datatables = datatables[0].get("table_header")

                table_forms = DataTableForms(
                    {"dashboard": new_board.dashboard_id, "table_header": datatables}
                )
                if table_forms.is_valid():
                    new_board.datatables = True
                    new_board.save()
                    table_forms.save()
                else:
                    errors.append(table_forms.errors)
                    print(f"table forms = {table_forms.errors}")
            all_charts = Charts.objects.filter(dashboard_id=dashboard_id).values()
            for chart in all_charts:
                chart["dashboard"] = new_board.dashboard_id
                chart = set_none_values(chart)
                new_chart = CopyChartsForm(chart)
                if new_chart.is_valid():
                    new_chart.save()
                else:
                    errors.append(new_chart.errors)

            filters = Filter.objects.filter(dashboard_id=dashboard_id).values()
            for filter in filters:
                del filter["id"]
                filter["dashboard"] = new_board.dashboard_id
                filter_form = ValidateFilters(filter)
                if filter_form.is_valid():
                    new_filter = filter_form.save()
                    new_filter.unchecked_values = filter.get("unchecked_values")
                    new_filter.save()
                else:
                    print(f"\n\nfilter errors are = {filter_form}\n\n")
            basket_selection = BasketSelection.objects.filter(
                dashboard_id=dashboard_id
            ).values()
            for basket in basket_selection:
                del basket["id"]
                basket["dashboard"] = new_board.dashboard_id
                basket["basket"] = basket["basket_id"]
                print(f"\n\nthe basket parameters are as follow: ={basket}\n\n")
                basket_form = BasketSelectionForm(basket)
                if basket_form.is_valid():
                    basket_form.save()
                else:
                    errors.append(basket_form.errors)
                    print(f"basket selection {basket_form.errors}")

        if errors:
            new_board.delete()
            response = {"working": errors}
        else:
            redirect_url = reverse("dashhome", args=[new_board.dashboard_id])
            response = {"redirect": redirect_url}
        return Response(response)
