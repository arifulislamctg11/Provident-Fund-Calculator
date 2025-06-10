import frappe

@frappe.whitelist()
def get_pf_report_data(employee_id=None):
    doc = frappe.get_doc("Provident Fund Summary", {"employee_id": employee_id})

    return {
        "employee_name": doc.employee_name,
        "employee_id": doc.employee_id,
        "designation": doc.designation,
        "data": doc.monthly_pf # replace with your child table fieldname
    }
