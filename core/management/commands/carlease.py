from google.cloud import bigquery
from google.oauth2 import service_account
from core.core_models import *
import datetime
import re
from django.core.management import BaseCommand
from core.core_models import OpenXchange
from tqdm import tqdm
import pandas as pd
import sys

credentials = service_account.Credentials.from_service_account_file("./new_auth.json")
project_id = "py-engine-wmc"
commad_line_pid = sys.argv[-1]
client = bigquery.Client(credentials=credentials, project=project_id)
query_job = client.query(
    """
SELECT * FROM `py-engine-wmc.VWFSCarLeasing.CarLeasing`"""
)
# Santander_Cars.santander_data
# Santander_Bike_Calculated.SantanderBikeCalculated
required_format = {  # should be same positions as bigquery and must correspond to types it should be in mongodb
    "DateExtractRun": "date",
    "Customer": "str",
    "Basket": "str",
    "Manufacturer": "str",
    "Brand": "str",
    "Model": "str",
    "MonthlyCharge": "number",
    "RentalProfile": "str",
    "AnnualMileage": "number",
    "InitialRental": "number",
    "AdditionalFees": "number",
    "FuelType": "str",
    "Transmission": "str",
    "BodyStyle": "str",
    "CO2": "number",
    "Doors": "number",
    "DriveTrain": "str",
    "ProductionStatus": "str",
    "Company": "str",
    "WebpageURL": "str",
    "CarimageURL": "str",
}
results = query_job.result()
# results = pd.read_csv(
#     "Sykes_Cottages_File_05_07_2023 (1).csv", low_memory=False
# ).fillna("N/A")


def convert_eurotousd(value):
    value = value.split(",")
    if len(value) == 2:
        decimal = value[-1]
        main_value = value[0].replace(".", "")
        value = main_value + "." + decimal
    else:
        value = value[0].replace(".", "").replace(",", ".")
    return value


def return_format(val="34.56"):
    val = val.split(",")
    if len(val[-1]) == 2 and len(val) > 1:
        return "EUR"
    else:
        return "USD"


def extract_prices(val="34.53") -> float:
    if type(val) == type("") and val != "N/A":
        if "unlimited" in val.lower():
            return "Unlimited"
        if return_format(val) == "EUR":
            val = convert_eurotousd(val)
        patterns = [r"\d+.\d+|\d+"]
        val = val.replace(",", "")
        for pattern in patterns:
            val = re.findall(pattern, val)
            if len(val) == 0:
                val = 0
            else:
                try:
                    val = float(val[0])
                except:
                    val = 0
                break
    return val


def return_date(required_format="%Y-%m-%d", date_value="") -> str:
    if datetime.date == type(date_value):
        date_value = date_value.strftime(required_format)
    elif type(date_value) == type(""):
        possible_formats = [
            # "%d/%m/%Y",
            "%m/%d/%Y",
            "%Y/%m/%d",
        ]
        for format in possible_formats:
            try:
                date_value = datetime.datetime.strptime(date_value, format).strftime(
                    required_format
                )
                break
            except:
                continue
    return date_value


def not_required(val, ty="number or string") -> int:
    if ty == "number":
        if type(val) == str:
            if val.isdigit():
                return float(val)
        return val
    else:
        nr = ["N/A"]
        if type(val) == type(""):
            for n in nr:
                if n in val:
                    return 0
        return val


def parser_for_db(row):
    required_format = {  # should be same positions as bigquery and must correspond to types it should be in mongodb
        "DateExtractRun": "date",
        "Customer": "str",
        "Basket": "str",
        "Manufacturer": "str",
        "Brand": "str",
        "Model": "str",
        "MonthlyCharge": "number",
        "RentalProfile": "str",
        "AnnualMileage": "number",
        "InitialRental": "number",
        "AdditionalFees": "number",
        "FuelType": "str",
        "Transmission": "str",
        "BodyStyle": "str",
        "CO2": "number",
        "Doors": "number",
        "DriveTrain": "str",
        "ProductionStatus": "str",
        "Company": "str",
        "WebpageURL": "str",
        "CarimageURL": "str",
    }
    new_row = []
    for num, col in enumerate(required_format):
        type = required_format.get(col)
        if type == "date":
            new_row.append(return_date(date_value=row[num]))
        elif type == "number":
            new_row.append(not_required(extract_prices(row[num]), "number"))
        else:
            new_row.append(row[num])
    new_row = [not_required(val) for val in new_row]
    return new_row


class Command(BaseCommand):
    help = "import booms"

    def add_arguments(self, parser):
        parser.add_argument("value", type=int, help="The value argument.")

    def handle(self, *args, **options):
        commad_line_pid = options["value"]
        main = "datafiles/"
        csv = {}
        keys = [key for key in required_format.keys()]
        project = SubProject.objects.filter(project_id=commad_line_pid)[0]
        # for num, col in tqdm(enumerate(results)):
        for num, col in tqdm(enumerate(results)):
            # col = results.iloc[num]
            # try:
            row = {
                list(required_format.keys())[num]: value
                for num, value in enumerate(parser_for_db(col))
            }
            row["CarimageURL"] = row["CarimageURL"][:1000]
            # input(f'row is = {row}')
            # except:
            #     continue
            models = VwfsCarLeasing(
                **row,
                dataset_id=project,
            )
            try:
                models.save()
            except Exception as e:
                input(f"except: {e} \n{row}")
