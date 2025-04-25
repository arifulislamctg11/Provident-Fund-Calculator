import frappe

def execute():
    # Get the Monthly PF Report
    report = frappe.get_doc("Report", "Monthly PF Report")
    
    # Clear any existing permissions for this report
    report.permissions = []
    
    # Add the permission for System Manager
    report.append("permissions", {
        "role": "System Manager",
        "permlevel": 0,
        "read": 1,
        "report": 1
    })
    
    # Save the changes
    report.save()
    frappe.db.commit()
