from django.db.models import Q
from django.db.models import Avg, Sum, Min, Max, Count
import datetime
from random import randint
from dashboard.dash_services import find_request_model
import json

DATE_FORMAT = "%Y-%m-%d"


def parse_chart_data(updated_data) -> None:
    
    if updated_data["filters"]:
        updated_data["filters"] = json.dumps(updated_data["filters"])
    x = json.dumps(updated_data.get("x"), separators=(",", ":"))
    y = json.dumps(updated_data.get("y"), separators=(",", ":"))
    updated_data["chart_y"] = y
    updated_data["chart_x"] = x
    del updated_data["x"]
    del updated_data["y"]


def get_default_dimension(project_id=1) -> str:
    """
    it finds field name and return to the charts api to generate data.
    """
    project_model = find_request_model(project_id)
    fields = get_model_fields(project_model)
    chars_fields = []
    for name, col_type in fields.items():
        if col_type == "CharField":
            chars_fields.append(name)
    default_range = 3
    if len(chars_fields) < default_range:
        default_range = len(chars_fields)
    return chars_fields[randint(0, default_range)]


def get_model_fields(project_model=[]) -> dict:
    "returns the model fields"
    return {
        field.name: field.get_internal_type()
        for field in project_model[0]._meta.get_fields()[1:-1]
    }


def return_filters(filters) -> Q:
    """Accepts Dictionary of filters and returns a generic Query for ORM"""
    if filters == None:
        filters = []
    or_conditions = []
    query = Q()
    for inst_filter in filters:
        for (
            key
        ) in (
            inst_filter.keys()
        ):  # inst_filer is the dictionary {'date':'23,234, 'col2':'col2values,'}
            temp = Q()
            value = inst_filter.get(key)
            for val in value.split(","):
                temp |= Q(**{key: val})
            or_conditions.append(temp)
            query &= temp
    return query


def return_group(filters) -> str:
    """
    The return group method returns 
    *args for one and at max two arguments for ORM query
    """
    dimension = filters.get("Dimension")
    breakdown = filters.get("Breakdown")
    if dimension != None and breakdown != None:
        return (dimension, breakdown)
    elif dimension != None:
        return (dimension,)
    return False


def return_metric_operation(ops):
    """Returns required Computation operation"""
    return {"avg": Avg, "min": Min, "max": Max, "sum": Sum, "count": Count}.get(ops, -1)


def organzise_dataset(dataset=[]) -> list:
    """
    Organize Dataset prepare the X, Y where X is Dimension 1 & Y is Dimension 2.
    """
    axis_x = []
    breakdown = []
    test_breakdown = []
    LIMIT = 50
    KEYS = list(dataset[0].keys())
    for inst in dataset:
        keys = list(inst.keys())
        data_inst = inst.get(keys[0])
        if isinstance(data_inst, datetime.date):
            data_inst = data_inst.strftime(DATE_FORMAT)
        bd_inst = inst.get(keys[1])
        if data_inst not in axis_x:
            axis_x.append(data_inst)
        if bd_inst not in breakdown:
            breakdown.append(bd_inst)  # = []
    axis_x = axis_x[0:80]  # setting the X bar limit to 50
    zeros = [0 for i in axis_x]
    breakdown = breakdown[0:50]
    for x in axis_x:
        count = 0
        for d in dataset:
            data_inst = (
                d.get(KEYS[0]).strftime(DATE_FORMAT)
                if isinstance(data_inst, datetime.date)
                else d.get(KEYS[0])
            )
            if x == data_inst:
                count += 1
                if d.get(KEYS[1]) not in test_breakdown and count <= LIMIT:
                    test_breakdown.append(d.get(KEYS[1]))

    # breakdown = {
    #     key.strftime(DATE_FORMAT)
    #     if isinstance(key, datetime.date)
    #     else key: zeros.copy()
    #     for key in breakdown
    #
    breakdown = {
        key.strftime(DATE_FORMAT)
        if isinstance(key, datetime.date)
        else key: zeros.copy()
        for key in test_breakdown
    }
    # print(f'\n\nfinal breakdown is = {breakdown}\n\ntest {test_breakdown}')
    return dataset, axis_x, breakdown


def secondary_sort(x_axis, y_axis, secondary=True) -> None:
    for num, _ in enumerate(x_axis):
        temp = []
        for key in y_axis:
            x_label_value = y_axis.get(key)[num]
            temp.append(x_label_value)
        temp = sorted(temp, reverse=secondary)
        for xnum, key in enumerate(y_axis):
            y_axis[key][num] = temp[xnum]


def trend_data_formating(data_set, total_dims, metric=None, secondary=False) -> list:
    """X,Y are processed according to ECharts format and returned to the caller method. """
    x_axis = []
    y_axis = {}
    if total_dims == 2:
        data_set, x_axis, y_axis = organzise_dataset(dataset=data_set)
    for inst in data_set:
        key = list(inst.keys())
        value = inst.get(key[0])
        if isinstance(value, datetime.date):
            value = value.strftime(DATE_FORMAT)
        if value not in x_axis and total_dims == 1:
            x_axis.append(value)
        elif value not in x_axis:
            continue
        if total_dims == 2:
            label = inst.get(key[1])
            if isinstance(label, datetime.date):
                label = label.strftime(DATE_FORMAT)
            amount = round(inst.get(key[2]), 2)
            if label in y_axis:
                y_axis[label][x_axis.index(value)] = amount
        elif total_dims == 1:
            label = key[1]
            amount = round(inst.get(label), 2)
            if label not in y_axis:
                y_axis[label] = [amount]
            else:
                y_axis[label].append(amount)
    if "0" in y_axis:
        del y_axis["0"]
    if "metric" in y_axis.keys():
        copy_list = y_axis.get("metric").copy()
        del y_axis["metric"]
        y_axis[metric] = copy_list
    secondary_sort(x_axis, y_axis, secondary)
    return x_axis, y_axis
