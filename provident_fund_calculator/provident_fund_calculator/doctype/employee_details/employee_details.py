from frappe.model.document import Document
from datetime import date
from dateutil.relativedelta import relativedelta
import frappe
from frappe.utils import getdate, nowdate, add_months

class EmployeeDetails(Document):
    def before_save(self):
        self.fill_monthly_pf_percent()
        self.update_future_basic_salary()
        self.update_all_months()

    def get_end_date(self):
        # Return resignation date if exists, otherwise return today's date
        return getdate(self.resignation_date) if self.resignation_date else date.today()

    def fill_monthly_pf_percent(self):
        if not self.date_of_confirmation:
            return

        start_date = getdate(self.date_of_confirmation)
        end_date = self.get_end_date()  # Use the new method here

        current = date(start_date.year, start_date.month, 1)
        last = date(end_date.year, end_date.month, 1)

        month_names = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]

        existing_keys = {
            (row.month, int(row.year))
            for row in self.monthly_pf_percent
            if row.month and row.year is not None
        }

        while current <= last:
            month = month_names[current.month - 1]
            year = current.year

            if (month, year) not in existing_keys:
                self.append('monthly_pf_percent', {
                    'month': month,
                    'year': year,
                    'basic_salary': 0  
                })

            current += relativedelta(months=1)

    def validate(self):
        self.generate_monthly_pf_rows()
        self.update_all_months()
        self.update_future_basic_salary()

    def generate_monthly_pf_rows(self):
        if not self.date_of_confirmation:
            frappe.throw("Please set the Date of Confirmation.")

        start_date = getdate(self.date_of_confirmation)
        end_date = self.get_end_date()  # Use the new method here

        month_names = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]

        months = []
        while start_date <= end_date:
            month_name = month_names[start_date.month - 1]
            year = start_date.year
            months.append((month_name, year))
            start_date = add_months(start_date, 1)

        existing_keys = {(row.month, row.year) for row in self.monthly_pf_percent}
        for month, year in months:
            if (month, year) not in existing_keys:
                self.append("monthly_pf_percent", {
                    "month": month,
                    "year": year,
                    "basic_salary": 0
                })

        self.monthly_pf_percent = sorted(
            self.monthly_pf_percent, key=lambda x: (x.year, month_names.index(x.month))
        )
                            
    def update_all_months(self):
        if not self.date_of_confirmation:
            frappe.throw("Please set the Date of Confirmation.")

        confirmation_date = getdate(self.date_of_confirmation)

        sorted_rows = sorted(
            self.monthly_pf_percent,
            key=lambda row: (row.year, self.month_to_index(row.month))
        )

        latest_updated_salary = None
        update_from_index = None

        for i, row in enumerate(sorted_rows):
            if row.basic_salary and float(row.basic_salary) > 0:
                latest_updated_salary = float(row.basic_salary)
                update_from_index = i

        if latest_updated_salary and update_from_index is not None:
            for i in range(update_from_index + 1, len(sorted_rows)):
                sorted_rows[i].basic_salary = latest_updated_salary

        for row in sorted_rows:
            basic = float(row.basic_salary or 0)

            row.employee_share_basic5 = round(basic * 0.05, 2)

            row_date = date(row.year, self.month_to_index(row.month) + 1, 1)
            tenure_years = (row_date - confirmation_date).days / 365

            if tenure_years < 5:
                row.association_contribution100 = 0
            elif 5 <= tenure_years < 7:
                row.association_contribution100 = round(row.employee_share_basic5 * 0.5, 2)
            elif 7 <= tenure_years < 9:
                row.association_contribution100 = round(row.employee_share_basic5 * 0.75, 2)
            else:
                row.association_contribution100 = round(row.employee_share_basic5, 2)

            row.total_deposit = round(row.employee_share_basic5 + row.association_contribution100, 2)
            row.net_amount = row.total_deposit


    def month_to_index(self, month_name):
        month_names = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        return month_names.index(month_name)

        
    def update_future_basic_salary(self):
        if not self.monthly_pf_percent:
            return

        month_order = {
            "January": 1, "February": 2, "March": 3, "April": 4, "May": 5,
            "June": 6, "July": 7, "August": 8, "September": 9,
            "October": 10, "November": 11, "December": 12
        }

        sorted_rows = sorted(
            self.monthly_pf_percent,
            key=lambda row: (int(row.year), month_order.get(row.month, 0))
        )

        last_change_index = 0
        highest_salary = float(sorted_rows[0].basic_salary or 0)
        
        for i in range(1, len(sorted_rows)):
            current_salary = float(sorted_rows[i].basic_salary or 0)
            if current_salary > highest_salary:
                highest_salary = current_salary
                last_change_index = i

        if last_change_index == 0:
            return

        correct_salary = float(sorted_rows[last_change_index].basic_salary or 0)

        changes_made = False
        for i in range(last_change_index + 1, len(sorted_rows)):
            row = sorted_rows[i]
            current_salary = float(row.basic_salary or 0)
            if current_salary != correct_salary:
                # frappe.msgprint(
                #     f"Updating {row.month} {row.year} from ₹{current_salary} to ₹{correct_salary}",
                #     alert=True
                # )
                row.basic_salary = correct_salary
                row.db_update()
                changes_made = True

        if changes_made:
            self.flags.dirty = True
            # frappe.msgprint(
            #     f"All future salaries updated to match the highest salary (₹{correct_salary})",
            #     alert=True
            # )

