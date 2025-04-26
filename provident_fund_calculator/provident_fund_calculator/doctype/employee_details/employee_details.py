import frappe
from frappe.model.document import Document
from frappe.utils import getdate  

class EmployeeDetails(Document):
    def validate(self):
        self.update_pf_percentage()

    def update_pf_percentage(self):
        frappe.msgprint(f"Updating PF for: {self.name}")

        if not self.date_of_confirmation:
            frappe.throw("Date of Confirmation not set.")

        confirmation_date = getdate(self.date_of_confirmation)
        confirmation_year = confirmation_date.year
        frappe.msgprint(f"Confirmation Year: {confirmation_year}")

        if not isinstance(self.monthly_pf_percent, list) or not self.monthly_pf_percent:
            frappe.msgprint("No valid rows in monthly_pf_percent table.")
            return

        updated_rows = 0

        for row in self.monthly_pf_percent:
            if row.year and isinstance(row.year, (int, str)):
                try:
                    row_year = int(row.year)
                    years_of_service = row_year - confirmation_year
                    # frappe.msgprint(f"Years of Service: {years_of_service}")

                    if years_of_service < 5:
                        row.provident_fund_percent = 0
                    elif 5 <= years_of_service < 7:
                        row.provident_fund_percent = 50
                    elif 7 <= years_of_service < 9:
                        row.provident_fund_percent = 75
                    elif 9 <= years_of_service <= 10:
                        row.provident_fund_percent = 100
                    else:
                        row.provident_fund_percent = 100

                    updated_rows += 1
                except ValueError:
                    frappe.msgprint(f"Invalid year format: {row.year}")
            else:
                frappe.msgprint("Empty or incorrect year value.")

