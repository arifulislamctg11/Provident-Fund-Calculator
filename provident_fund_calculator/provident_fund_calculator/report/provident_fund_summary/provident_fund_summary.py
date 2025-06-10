# import frappe

# def execute(filters=None):
#     columns = get_columns()
#     data = get_data(filters)
#     return columns, data

# def execute(filters=None):
#     columns = get_columns()
#     data = get_data(filters)

#     # Get employee info
#     employee_info = frappe.db.get_value(
#         "Employee Details",
#         filters.get("employee"),
#         ["employee_id", "designation"],
#         as_dict=True
#     )

#     return columns, data, None, None, {
#         "employee_info": employee_info,
#         "filters": filters
#     }


# def get_columns():
#     return [
#         {"label": "Employee", "fieldname": "parent", "fieldtype": "Link", "options": "Employee Details", "width": 130},
#         {"label": "Month", "fieldname": "month", "fieldtype": "Data", "width": 100},
#         {"label": "Year", "fieldname": "year", "fieldtype": "Int", "width": 80},
#         {"label": "Basic Salary", "fieldname": "basic_salary", "fieldtype": "Currency", "width": 120},
#         {"label": "Employee Share", "fieldname": "employee_share_basic5", "fieldtype": "Currency", "width": 120},
#         # {"label": "Association Contribution", "fieldname": "association_contribution100", "fieldtype": "Currency", "width": 120},
#         {"label": "Total Deposit", "fieldname": "total_deposit", "fieldtype": "Currency", "width": 100},
#         {"label": "Net Amount", "fieldname": "net_amount", "fieldtype": "Currency", "width": 100},
#     ]

# def get_data(filters):
#     def safe_float(val):
#         try:
#             return float(val)
#         except (ValueError, TypeError):
#             return 0.0

#     conditions = ""
#     if filters:
#         if filters.get("employee_id"):
#             conditions += f" AND ed.employee_id = '{filters['employee_id']}'"
#         if filters.get("employee"):
#             conditions += f" AND ed.first_name = '{filters['employee']}'"

#     data = frappe.db.sql(f"""
#         SELECT
#             ed.name AS parent,
#             mpf.month,
#             mpf.year,
#             mpf.employee_share_basic5,
#             mpf.association_contribution100,
#             mpf.total_deposit,
#             mpf.net_amount,
#             mpf.basic_salary
#         FROM
#             `tabEmployee Details` ed
#         JOIN
#             `tabMonthly PF` mpf ON mpf.parent = ed.name
#         WHERE
#             mpf.parenttype = 'Employee Details'
#             {conditions}
#         ORDER BY
#             mpf.year ASC,
#             FIELD(mpf.month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'),
#             ed.name
#     """, as_dict=True)

#     # Totals
#     total_employee_share = sum(safe_float(row["employee_share_basic5"]) for row in data)
#     total_association = sum(safe_float(row["association_contribution100"]) for row in data)
#     total_deposit = sum(safe_float(row["total_deposit"]) for row in data)
#     total_net_amount = sum(safe_float(row["net_amount"]) for row in data)
#     total_basic_salary = sum(safe_float(row["basic_salary"]) for row in data)

#     # Append total row
#     data.append({
#         "parent": "Total",
#         "month": "",
#         "year": "",
#         "basic_salary": total_basic_salary,
#         "employee_share_basic5": total_employee_share,
#         "association_contribution100": total_association,
#         "total_deposit": total_deposit,
#         "net_amount": total_net_amount,
#     })

#     return data


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
        {"label": "Basic Salary", "fieldname": "basic_salary", "fieldtype": "Currency", "width": 120},
        {"label": "Employee Share", "fieldname": "employee_share_basic5", "fieldtype": "Currency", "width": 120},
        {"label": "Total Deposit", "fieldname": "total_deposit", "fieldtype": "Currency", "width": 100},
        {"label": "Net Amount", "fieldname": "net_amount", "fieldtype": "Currency", "width": 100},
    ]

def get_data(filters):
    def safe_float(val):
        try:
            return float(val)
        except (ValueError, TypeError):
            return 0.0

    conditions = ""
    if filters:
        if filters.get("employee_id"):
            conditions += f" AND ed.employee_id = '{filters['employee_id']}'"
        if filters.get("employee"):
            conditions += f" AND ed.first_name = '{filters['employee']}'"

    data = frappe.db.sql(f"""
        SELECT
            ed.name AS parent,
            mpf.month,
            mpf.year,
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
            mpf.year ASC,
            FIELD(mpf.month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'),
            ed.name
    """, as_dict=True)

    # Totals
    total_employee_share = sum(safe_float(row["employee_share_basic5"]) for row in data)
    total_association = sum(safe_float(row["association_contribution100"]) for row in data)
    total_deposit = sum(safe_float(row["total_deposit"]) for row in data)
    total_net_amount = sum(safe_float(row["net_amount"]) for row in data)
    total_basic_salary = sum(safe_float(row["basic_salary"]) for row in data)

    # Append total row
    data.append({
        "parent": "Total",
        "month": "",
        "year": "",
        "basic_salary": total_basic_salary,
        "employee_share_basic5": total_employee_share,
        "association_contribution100": total_association,
        "total_deposit": total_deposit,
        "net_amount": total_net_amount,
    })

    return data
