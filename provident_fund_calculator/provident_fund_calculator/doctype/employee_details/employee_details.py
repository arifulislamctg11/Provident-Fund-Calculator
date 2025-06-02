from frappe.model.document import Document
from frappe.utils import getdate, add_months
import frappe
from datetime import date

class EmployeeDetails(Document):
   
    MONTH_NAMES = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    
    MONTH_ORDER = {month: idx+1 for idx, month in enumerate(MONTH_NAMES)}
    
    def before_save(self):
        """Main method called before saving the document"""
        self.validate_date_of_confirmation()
        self.generate_monthly_pf_rows()
        self.update_all_months()
        self.update_future_basic_salary()
    
    def validate_date_of_confirmation(self):
        """Validate that date of confirmation is set"""
        if not self.date_of_confirmation:
            frappe.throw("Date of Confirmation is required to calculate PF contributions")

    def get_end_date(self):
        """Get the end date for PF calculation (resignation date or current date)"""
        return getdate(self.resignation_date) if self.resignation_date else getdate()
    
    def generate_monthly_pf_rows(self):
        """Generate monthly PF rows from confirmation date to end date"""
        start_date = getdate(self.date_of_confirmation)
        end_date = self.get_end_date()
        
        
        existing_keys = {
            (row.month, int(row.year))
            for row in self.get("monthly_pf_percent", [])
            if row.month and row.year is not None
        }
        
        current = date(start_date.year, start_date.month, 1)
        last = date(end_date.year, end_date.month, 1)

        while current <= last:
            month = self.MONTH_NAMES[current.month - 1]
            year = current.year

            if (month, year) not in existing_keys:
                self.append("monthly_pf_percent", {
                    "month": month,
                    "year": year,
                    "basic_salary": 0,
                    "employee_share_basic5": 0,
                    "association_contribution100": 0,
                    "total_deposit": 0,
                    "net_amount": 0
                })

            current = add_months(current, 1)
        
        
        if hasattr(self, "monthly_pf_percent"):
            self.monthly_pf_percent.sort(key=lambda x: (x.year, self.MONTH_ORDER.get(x.month, 0)))
    
    def update_all_months(self):
        """Update all PF calculations for each month"""
        if not hasattr(self, "monthly_pf_percent") or not self.monthly_pf_percent:
            return

        confirmation_date = getdate(self.date_of_confirmation)
        latest_salary = 0

        for row in self.monthly_pf_percent:
            current_salary = flt(row.basic_salary)
            if current_salary > latest_salary:
                latest_salary = current_salary
            elif current_salary < latest_salary:
                row.basic_salary = latest_salary

            # Calculate employee contribution (5% of basic salary)
            row.employee_share_basic5 = round(latest_salary * 0.05, 2)
            
            # Calculate association contribution based on tenure
            row_date = date(int(row.year), self.MONTH_ORDER.get(row.month, 1), 1)
            tenure_years = (row_date - confirmation_date).days / 365.25  

            if tenure_years < 5:
                row.association_contribution100 = 0
            elif tenure_years < 7:
                row.association_contribution100 = round(row.employee_share_basic5 * 0.5, 2)
            elif tenure_years < 9:
                row.association_contribution100 = round(row.employee_share_basic5 * 0.75, 2)
            else:
                row.association_contribution100 = row.employee_share_basic5

            # Calculate totals
            row.total_deposit = round(row.employee_share_basic5 + row.association_contribution100, 2)
            row.net_amount = row.total_deposit
    
    def update_future_basic_salary(self):
        """Ensure basic salary never decreases in subsequent months"""
        if not hasattr(self, "monthly_pf_percent") or not self.monthly_pf_percent:
            return

        
        max_salary = 0
        last_increase_index = 0
        
        for i, row in enumerate(self.monthly_pf_percent):
            current_salary = flt(row.basic_salary)
            if current_salary > max_salary:
                max_salary = current_salary
                last_increase_index = i
        
        
        for row in self.monthly_pf_percent[last_increase_index+1:]:
            if flt(row.basic_salary) < max_salary:
                row.basic_salary = max_salary

    def validate(self):
        """Validate the document"""
        self.validate_date_of_confirmation()
        self.generate_monthly_pf_rows()
        self.update_all_months()
        self.update_future_basic_salary()

    def on_update(self):
        """After document is saved"""
        frappe.msgprint("Employee PF details updated successfully", alert=True)

def flt(value):
    """Safe float conversion"""
    try:
        return float(value or 0)
    except (ValueError, TypeError):
        return 0.0