from .chart_services import DATE_FORMAT
import datetime
from django.test import RequestFactory


def process_filters(data, column_name) -> str:
    filters_values = {}
    filters_values = []
    for filter_data in data:
        data_inst = filter_data.get(column_name)
        if isinstance(data_inst, datetime.date):
            data_inst = data_inst.strftime(DATE_FORMAT)
        filters_values.append(f"{data_inst}")
    filters_values = ",".join(filters_values)
    return filters_values


def update_if_required(
    filters=[], view="Django View", model=object, update_form=object
) -> list:
    todays = datetime.date.today()
    for filter in filters:
        filter_update = filter.get("updated_at")
        if filter_update < todays:
            payload = {
                "updated": True,
                "dashboard_id": filter.get("dashboard_id"),
                "column_name": filter.get("filter_column"),
            }
            temp = RequestFactory().post("/filters/", data=payload)
            response = view(
                temp
            ).data  # response contains updated filter values separated by commas
            data = response.get("filter_values")
            if data:
                filter["filter_values"] = data
                resource_id = filter.get("id")
                put_data = {
                    "filter_column": filter.get("filter_column"),
                    "filter_values": data,
                    "limit": filter.get("limit"),
                }
                instance = model.objects.get(id=resource_id)
                form = update_form(instance=instance, data=put_data)
                if form.is_valid():
                    form.save()

    return filters
