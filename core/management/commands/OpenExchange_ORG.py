from google.cloud import bigquery
from google.oauth2 import service_account
from core.core_models import *
import datetime
import re
from django.core.management import BaseCommand
from core.core_models import OpenXchange
from tqdm import tqdm

# import sys
# commad_line_pid = sys.argv[-1]
credentials = service_account.Credentials.from_service_account_file("./new_auth.json")
project_id = "py-engine-wmc"
client = bigquery.Client(credentials=credentials, project=project_id)
query_job = client.query(
    """
SELECT * FROM py-engine-wmc.OpenXchange.OpenXchange"""
)
# Santander_Cars.santander_data
# Santander_Bike_Calculated.SantanderBikeCalculated
required_format = {  # should be same positions as bigquery and must correspond to types it should be in mongodb
    "DateExtractRun": "date",
    "Competitor": "str",
    "Company": "str",
    "Country": "str",
    "Category": "str",
    "Product": "str",
    "ProductCategory": "str",
    "StandardizedProductCategory": "str",
    "MonthlyPrice": "number",
    "AnnualPrice": "number",
    "ActualAnnualPrice": "str",
    "Currency": "str",
    "MonthlyPriceUSD": "number",
    "AnnualPriceUSD": "number",
    "ActualAnnualPriceUSD": "number",
    "NoOfUsers": "str",
    "Storage": "str",
    "Duration": "str",
    "BillingPeriod": "str",
    "PromotionType": "str",
    "Promotion": "str",
    "PromotionText": "str",
    "PriceAfterIntialTerm": "number",
    "StorageFeature": "str",
    "DomainFeature": "str",
    "WebMailFeature": "str",
    "CalenderFeature": "str",
    "ProtectionFeature": "str",
    "Features": "str",
    "Link": "str",
    "Date": "date",
    "Change": "str",
    "ChangeType": "str",
    "MonthlyUSDPriceDifference": "number",
    "AnnuallyUSDPriceDifference": "number",
    "OldMonthlyUSDPrice": "number",
    "OldAnnuallyUSDPrice": "number",
    "PromotionChangeType": "str",
    "OldPromotionText": "str",
}
results = query_job.result()


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
        possible_formats = ["%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"]
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
        "Competitor": "str",
        "Company": "str",
        "Country": "str",
        "Category": "str",
        "Product": "str",
        "ProductCategory": "str",
        "StandardizedProductCategory": "str",
        "MonthlyPrice": "number",
        "AnnualPrice": "number",
        "ActualAnnualPrice": "str",
        "Currency": "str",
        "MonthlyPriceUSD": "number",
        "AnnualPriceUSD": "number",
        "ActualAnnualPriceUSD": "number",
        "NoOfUsers": "number",
        "Storage": "str",
        "Duration": "str",
        "BillingPeriod": "str",
        "PromotionType": "str",
        "Promotion": "str",
        "PromotionText": "str",
        "PriceAfterIntialTerm": "number",
        "StorageFeature": "str",
        "DomainFeature": "str",
        "WebMailFeature": "str",
        "CalenderFeature": "str",
        "ProtectionFeature": "str",
        "Features": "str",
        "Link": "str",
        "Date": "date",
        "Change": "str",
        "ChangeType": "str",
        "MonthlyUSDPriceDifference": "number",
        "AnnuallyUSDPriceDifference": "number",
        "OldMonthlyUSDPrice": "number",
        "OldAnnuallyUSDPrice": "number",
        "PromotionChangeType": "str",
        "OldPromotionText": "str",
    }
    new_row = []
    for num, col in enumerate(required_format):
        type = required_format.get(col)
        if type == "date":
            new_row.append(return_date(date_value=row[num]))
        elif type == "number":
            new_row.append(not_required(extract_prices(row[num]), "number"))
        else:
            data = row[num]
            if data:
                data = data[:254]
            new_row.append(data)

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
        for num, col in tqdm(enumerate(results)):
            row = parser_for_db(col)
            models = OpenXchange(
                DateExtractRun=row[0],
                Competitor=row[1],
                Company=row[2],
                Country=row[3],
                Category=row[4],
                Product=row[5],
                ProductCategory=row[6],
                StandardizedProductCategory=row[7],
                MonthlyPrice=row[8],
                AnnualPrice=row[9],
                ActualAnnualPrice=row[10],
                Currency=row[11],
                MonthlyPriceUSD=row[12],
                AnnualPriceUSD=row[13],
                ActualAnnualPriceUSD=row[14],
                NoOfUsers=int(row[15]),
                Storage=row[16],
                Duration=row[17],
                BillingPeriod=row[18],
                PromotionType=row[19],
                Promotion=row[20],
                PromotionText=row[21],
                PriceAfterIntialTerm=row[22],
                StorageFeature=row[23],
                DomainFeature=row[24],
                WebMailFeature=row[25],
                CalenderFeature=row[26],
                ProtectionFeature=row[27],
                Features=row[28],
                Link=row[29][:240],
                Date=row[30],
                Change=row[31],
                ChangeType=row[32],
                MonthlyUSDPriceDifference=row[33],
                AnnuallyUSDPriceDifference=row[34],
                OldMonthlyUSDPrice=row[35],
                OldAnnuallyUSDPrice=row[36],
                PromotionChangeType=row[37],
                OldPromotionText=row[38],
                dataset_id=project,
            )
            models.save()
