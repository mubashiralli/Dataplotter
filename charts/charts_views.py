from rest_framework.views import APIView
from rest_framework.response import Response
from dashboard.dash_services import find_request_model
from django.db import models
from django.db.models import F, Window
from django.db.models.functions import RowNumber
from dashboard.dash_models import *
from .chart_services import *
from .charts_form import *
from .charts_models import Charts as Chart_model, Filter
from .filters_services import *
from django.core.paginator import Paginator
import time
from dashboard.dash_services import get_search_values


class ColorsView(APIView):
    """Still Under production"""

    def get(self, request, id):  # id is project id
        colors = {
            d.get("column_value"): d.get("colour")
            for d in ChartColor.objects.filter(project_id=id).values()
        }
        return Response({"colours": colors})

    def post(self, request):
        {
            "column_name": "Manufacturer",
            "column_value": "Jaguar",
            "colour": "red",
            "project": "4",
        }
        data = request.data
        form = ColorsForm(data)
        if form.is_valid():
            object = form.save()
            response = {"status": 200, "id": object.id}
        else:
            response = {"errors": form.errors}
        return Response(response)


class CreateFilters(APIView):
    def get(self, request, pk):  # ?did=1&mode=reload where did = dashboard_id
        """
        CreateFilters.GET method create a filter for the selected dashboard.
        The initial select of Column is automatic which later can be changed
        to desired column.
        """
        dash_id = request.GET.get("did")
        mode = request.GET.get("mode")
        project_model = find_request_model(pk)
        model_fields = get_model_fields(project_model)
        alread_created = [
            col.get("filter_column")
            for col in Filter.objects.filter(dashboard_id=dash_id)
            .order_by("id")
            .values()
        ]
        if mode:
            response = {
                "fields": alread_created,
                "project_id": pk,
                "dashboard_id": dash_id,
            }
        else:
            field_x = None
            for field in model_fields:
                if field in alread_created:
                    continue
                field_x = field
                break
            response = {"field": field_x, "project_id": pk, "dashboard_id": dash_id}
        return Response(response)


class FiltersView(APIView):
    """
    FiltersView Class handles:
    1. Searching
    2. Big Data filter management
    3. Support for new Column
    4. Update Filters after 24 hours
    """

    def get(self, request, id):
        """
        FilterView.Get method provides all functionalities to interact with filters.
        It returns values of the column using Paginator if the data is big.
        It also supports multiple modes such as newcol mode where it returns values of the column
        even if it's not created yet. In the default mode, it only returns the value for the column
        that are created by the user.

        """
        requested_col = request.GET.get("filter_column")
        page = request.GET.get("page", 1)
        mode = request.GET.get("mode", False)
        search_value = request.GET.get("search_value")
        project_id = request.GET.get("project_id")
        filters = request.GET.get("filters")
        model = find_request_model(project_id)
        if filters:
            filters = [filter.split(":") for filter in filters.split("|")]
            filters = {filter[0]: filter[1] for filter in filters}
            filters = return_filters([filters])
        else:
            filters = return_filters([{}])
        if mode == "newcol":
            if model:
                query_data = (
                    model[0]
                    .objects.filter(filters)
                    .all()
                    .values(requested_col)
                    .distinct()
                )
                fitler_values = process_filters(
                    data=query_data, column_name=requested_col
                )
                if query_data:
                    query_data = query_data[0]
                per_page = query_data.get("limit", 600)
                fitler_values = fitler_values.split(",")
                paginator = Paginator(fitler_values, per_page)
                page = paginator.get_page(page)
                filer_values = list(page.object_list)
                ismore = page.has_next()
                if ismore:
                    next_page = page.next_page_number()
                else:
                    next_page = None
                response = {
                    "dashboard": id,
                    "filter_column": requested_col,
                    "filter_values": filer_values,
                    "next": next_page,
                    "more_pages": ismore,
                }
                return Response(response)
        if requested_col:
            filters = {"filter_column": requested_col}
        else:
            filters = {}
        model_fields = {
            field.name: field.get_internal_type()
            for field in model[0]._meta.get_fields()[1:-1]
            if field.name in [requested_col]
        }
        objects = Filter.objects.filter(dashboard_id=id, **filters).values()
        if search_value:
            filters = get_search_values(model_fields, [search_value])
            result = [
                f"{value.get(requested_col)}"
                for value in model[0]
                .objects.filter(filters)
                .distinct()
                .values(requested_col)
            ]
            for obj in objects:
                obj["filter_values"] = ",".join(result)
        else:
            objects = update_if_required(
                objects, FiltersView().as_view(), Filter, UpdateFilterForms
            )
        for obj in objects:
            obj["filter_values"] = obj["filter_values"].split(",")
            if obj["unchecked_values"]:
                obj["unchecked_values"] = obj.get("unchecked_values", "").split(",")

        if objects:
            obj = objects[0]
            charts = Chart_model.objects.filter(dashboard_id=id)
            if charts:
                if charts[0].filters:
                    charts = json.loads(charts[0].filters)[0]
                    checked_values = charts.get(obj.get("filter_column"), "").split(",")
                    if "" in checked_values:
                        checked_values.remove("")
                else:
                    checked_values = []
            else:
                checked_values = []
            print(f'\n\nchecked values = {checked_values}\n\n')
            data = obj.get("filter_values")
            per_page = obj.get("limit")
            paginator = Paginator(data, per_page)
            page = paginator.get_page(page)
            data = list(page.object_list)
            for value in checked_values:
                if value in data:
                    data.remove(value)
            if page.number == 1:
                obj["filter_values"] = (
                    checked_values + data
                )  # updating the reference hash
            else:
                obj["filter_values"] = data  # updating the reference hash

            if len(checked_values) > 0:
                obj["unchecked_values"] = data
                print(f'checked values inside data')
            ismore = page.has_next()
            if ismore:
                next_page = page.next_page_number()
            else:
                next_page = None
            objects = objects[0]
        else:
            ismore = None
            next_page = None

        return Response({"data": objects, "more_pages": ismore, "next": next_page})

    def post(self, request):
        """
        FiltersView.POST creates Filters for any dashboard.
        The process is quite simple and easy to use.

        """
        body = request.data
        project_id = body.get("project_id")
        column_name = body.get("column_name")
        dashboard_id = body.get("dashboard_id")
        updated = body.get("updated")

        if updated:
            project_id = Dashboard.objects.get(dashboard_id=dashboard_id).project_id_id
            # print('\n\ninside post priror returning the update response \n')
        model = find_request_model(project_id)
        if model:
            query_data = model[0].objects.all().values(column_name).distinct()
            fitler_values = process_filters(data=query_data, column_name=column_name)
            if updated:
                return Response({"filter_values": fitler_values})
            raw_form = {
                "dashboard": dashboard_id,
                "filter_column": column_name,
                "filter_values": fitler_values,
            }

            filter_form = ValidateFilters(raw_form)
            if filter_form.is_valid():
                filter_form.save()
                status = "success"
            else:
                status = "failure"
        else:
            status = None
        return Response({"data": status})

    def put(self, request, id):  # ?update=unchecked :: id = chart id
        """
        {
        "unchecked_values":"val,val2"
        "search":True,
        "selected_values":[]
        }
        """
        """
        {
            "filter_column":"col1",
            "filter_values":[
                "testing testing",
                "fragment testing",
                "instagram testing"
            ],
            "limit":300
        }
        """
        update_data = request.data
        filter_object = Filter.objects.get(id=id)
        if request.GET.get("update", False):
            if update_data.get("search"):
                exluded = update_data.get("selected_values")
                column_name = filter_object.filter_column
                args = {f"{column_name}__in": exluded}
                update_data["unchecked_values"] = process_filters(
                    column_name=column_name,
                    data=find_request_model(filter_object.dashboard.project_id_id)[0]
                    .objects.all()
                    .values(column_name)
                    .distinct()
                    .exclude(**args),
                )
            else:
                update_data["unchecked_values"] = ",".join(
                    update_data["unchecked_values"]
                )
            uncheck_form = Update_Filter_Unchecked(filter_object, data=update_data)
            if uncheck_form.is_valid():
                uncheck_form.save()
                saved = {"saved": True}
            else:
                saved = {"saved": False, "error": uncheck_form.error_messages}
        else:
            update_data["filter_values"] = ",".join(update_data["filter_values"])
            chart_form = UpdateFilterForms(filter_object, data=update_data)
            if chart_form.is_valid():
                chart_form.save()
                saved = {"saved": True}
            else:
                saved = {"saved": False, "error": chart_form.error_messages}
        return Response(saved)
        pass

    def delete(self, request, id):
        object = Filter.objects.get(id=id).delete()
        if object:
            return Response({"response": True})
        return Response({"response": False})


class VisualCharts(APIView):
    """
    Visual Charts Class is responsible to maintain the smooth user experience.
    The API is soley configured to handle the creation of the charts with minimum
    user interaction & display of all the charts that are created for any requested
    dashboard.
    """

    def get(self, request, id):
        """
        Get returns all charts that are created by user
        for any dashboard.
        It take id as a parameter (where ID belongs to dashboard)
        and return all charts that are created on the dashboard.
        """
        models = list(Chart_model.objects.filter(dashboard_id=id).values())
        for chart in models:
            if chart["chart_x"]:
                chart["x"] = json.loads(chart.get("chart_x"))
                chart["y"] = json.loads(chart.get("chart_y"))
            del chart["chart_x"]
            del chart["chart_y"]
        return Response({"charts": models})

    def post(self, request) -> Response:
        """
        VisualCharts.POST method helps achieves the automatic creation of chart
        for any data point. This is helpful in making the HCI easy and improve
        the learning curve for the user.
        """
        body = request.data
        dashboard_id = body.get("dashboard")
        project_id = Dashboard.objects.filter(dashboard_id=dashboard_id).values()
        if project_id:
            project_id = project_id[0].get("project_id_id")
            dimension = get_default_dimension(project_id)
            body["dimension"] = dimension
            body["metric"] = "count"
            form = Create_Charts(body)
            if form.is_valid():
                chart = form.save()
                form_status = {
                    "dimension": dimension,
                    "metric": "count",
                    "project_id": project_id,
                    "chartpk": chart.id,
                }
        else:
            form_status = False
        return Response({"response": form_status})


class Charts(APIView):
    """
    The Charts class provides methods to query data for any given parameters (POST). The class also maintains
    the state of the charts by adating to updating the charts' state upon user input.
    The complete CRUD is implemented and being used in the frontend.
    """

    def get(self, request, pk):  # /projectid?chartid=pk
        """
        get method returns requested resource
        for a selected chart
        pk refered to the selected dataset
        chartid is the requested resource primary key
        """
        chartid = request.GET.get("chartid")
        project_model = find_request_model(pk)
        if project_model:
            model_fields = get_model_fields(project_model)
            chart = Chart_model.objects.filter(id=chartid).values(
                "dimension",
                "breakdown",
                "metric_column",
                "sorting",
                "metric",
                "secondary_sort",
            )
            if chart:
                chart = chart[0]
            response = {"fields": model_fields, "chart": chart}
        else:
            response = {}
        return Response(response)

    def post(self, request):
        """
        POST method is responsible for
        quering the selected project
        and updating the the charts
        in the realtime for better
        user experience.
        Payload:
        {
            "pid":4,
            "Filters":[{"DateExtractRun":"2023-06-06,2023-05-30","Competitor":"comp1,comp2"}],
            "Dimension": "DateExtractRun",
            "Breakdown":"StandardizedProductCategory",
            "Metric":"MonthlyPriceUSD",
            "Operation":"max",
            "Sort":"DEC",
            "Sort2":"ACE",
            "basket":null,
        }
        """
        start = time.time()
        body = request.data
        sub_project_id = body.get("pid")
        basket = body.get("basket")
        bar_filters = body.get("Filters")
        if basket:
            basket = Basket.objects.get(id=basket)
            basket_filters = json.loads(basket.includes_filters)
            for key in bar_filters[0]:
                if key not in basket_filters[0]:
                    basket_filters[0][key] = bar_filters[0].get(key)
            filters = return_filters(basket_filters)
            exuclude = return_filters(json.loads(basket.exclusive_filters))
        else:
            filters = return_filters(bar_filters)
            exuclude = return_filters({})
        get_group = return_group(body)
        sort = body.get("Sort", "ASC")
        secondary = False if body.get("secondary_sort", "ASC") == "ASC" else True
        if not get_group:
            return Response({"dimension": "Not Found"})
        dimension = get_group[0] if sort == "ASC" else "-" + get_group[0]
        order_value = "-" if sort != "ASC" else ""
        primary_sort = (
            dimension if body.get("tds", False) == False else order_value + "metric"
        )
        operation = return_metric_operation(body.get("Operation", "avg"))
        model = find_request_model(sub_project_id)
        metric = body.get("Metric")
        if model:
            if metric:
                model = (
                    model[0]
                    .objects.filter(filters, ~exuclude)
                    .values(*get_group)
                    .annotate(
                        metric=operation(metric, output_field=models.FloatField())
                    )
                    .order_by(primary_sort)
                )
            else:
                model = (
                    (
                        model[0]
                        .objects.filter(filters)
                        .order_by(dimension)
                        .values(*get_group)
                        .annotate(count=operation("pk"))
                    )
                    .order_by(order_value + "count")  # .order_by(dimension)
                    .distinct()
                )

            x, y = trend_data_formating(
                model,
                len(get_group),
                metric=f'{body.get("Operation", "avg").title()} : {metric}',
                secondary=secondary,
            )
        else:
            model = []
            x, y = None
        return Response({"time": time.time() - start, "x": x, "y": y})

    def put(self, request, pk):  # pk = primary key of a chart to update
        """
        PUT method is used when a chart
        is updated by the user.
        payload format
        {
            "name":"Bar Chart Updated",
            "js_name":"barchart",
            "filters":null,
            "chart_type":"1",
            "dimension":"TEST_COlUPDATE",
            "metric":"AVG UPDATED",
            "breakdown":null,
            "metric_column":null,
            "sorting":"DESC",
            "secondary_sort":"DESC",
            "x": [
                "2023-06-06",
                "2023-05-30"
            ],
            "y": {
                "record_count": [
                    956.46,
                    984.79
                ]
            }
        }
        """
        update_data = request.data
        parse_chart_data(update_data)
        chart = Chart_model.objects.get(id=pk)
        if chart:
            chart_form = Update_charts(chart, data=update_data)

            if chart_form.is_valid():
                chart_form.save()
                status = True
            else:
                status = chart_form.errors
            response = {"chart": status, "payload": update_data}
        else:
            response = False
        return Response(response)

    def delete(self, request, pk):
        """
        Delete method is called when the
        user has requested to delete the
        selected chart
        """
        chart = Chart_model.objects.get(id=pk)
        chart_name = chart.name
        chart.delete()
        return Response({"status": True, "chart_name": chart_name})
