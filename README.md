# Dataplotter

Dataplotter is a comprehensive data visualization portal designed to empower web applications with powerful graph/chart rendering and datatable functionalities. With Dataplotter, developers can seamlessly integrate dynamic visualizations into their web applications, enhancing data presentation and analysis capabilities.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Installation

1. Clone the repository.
2. Navigate to the project directory.
3. To install PostgreSQL on Linux, `sudo apt update; sudo apt install libpq-dev postgresql postgresql-contrib` and setup a user in postgres database. 
4. Install dependencies using `pip install -r requirements.txt`.
5. Run server using 'python manage.py runserver'

## Usage
1. Create a super-user to access the Django Adminstration Panel
2. Run `python manage.py makemigrations`, `python manage.py migrate` to access the Models
3. Create a group named "admin" and assign place your in the admin group.
4. Create a SubProject and link the database using its unique ID

Once the dataset is linkedin with a subproject, You can create multiple dashboard, charts, and datatables.

## License

This project is licensed under the [GNU GPL](LICENSE).

