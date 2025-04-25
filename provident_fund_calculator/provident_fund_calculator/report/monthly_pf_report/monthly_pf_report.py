import frappe

def execute(filters=None):
    columns = get_columns()
    data = get_data(filters)
    return columns, data

def get_columns():
    return [
        {"label": "Employee", "fieldname": "parent", "fieldtype": "Link", "options": "Employee Details", "width": 130},
        {"label": "Month", "fieldname": "month", "fieldtype": "Data", "width": 100},
        {"label": "Year", "fieldname": "year", "fieldtype": "Int", "width": 80},
        {"label": "PF %", "fieldname": "provident_fund_percent", "fieldtype": "Percent", "width": 80},
        {"label": "Employee Share", "fieldname": "employee_share_basic5", "fieldtype": "Currency", "width": 120},
        {"label": "Association Contribution", "fieldname": "association_contribution100", "fieldtype": "Currency", "width": 120},
        {"label": "Total Deposit", "fieldname": "total_deposit", "fieldtype": "Currency", "width": 100},
        {"label": "Net Amount", "fieldname": "net_amount", "fieldtype": "Currency", "width": 100},
        {"label": "Basic Salary", "fieldname": "basic_salary", "fieldtype": "Currency", "width": 120},
    ]

def get_data(filters):
    conditions = ""
    if filters and filters.get("month"):
        conditions += f" AND mpf.month = '{filters['month']}'"
    if filters and filters.get("year"):
        conditions += f" AND mpf.year = {filters['year']}"

    return frappe.db.sql(f"""
        SELECT
            ed.name AS parent,
            mpf.month,
            mpf.year,
            mpf.provident_fund_percent,
            mpf.employee_share_basic5,
            mpf.association_contribution100,
            mpf.total_deposit,
            mpf.net_amount,
            mpf.basic_salary
        FROM
            `tabEmployee Details` ed
        JOIN
            `tabMonthly PF` mpf ON mpf.parent = ed.name
        WHERE
            mpf.parenttype = 'Employee Details'
            {conditions}
        ORDER BY
            ed.name
    """, as_dict=True)

