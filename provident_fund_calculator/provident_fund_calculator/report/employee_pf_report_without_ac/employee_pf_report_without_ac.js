frappe.query_reports["Employee PF Report without AC"] = {
    add_total_row: 0,
    onload: function (report) {
        frappe.db.get_list('Employee Details', {
            fields: ['first_name', 'employee_id'],
            limit: 1000
        }).then(data => {
            const names = [...new Set(data.map(d => d.first_name).filter(Boolean))];
            const employeeFilter = report.get_filter('employee');
            employeeFilter.df.options = ["", ...names];
            employeeFilter.refresh();

            const ids = [...new Set(data.map(d => d.employee_id).filter(Boolean))];
            const employeeIDFilter = report.get_filter('employee_id');
            employeeIDFilter.df.options = ["", ...ids];
            employeeIDFilter.refresh();
        });
    },
    "filters": [
        {
            fieldname: "employee",
            label: __("Employee Name"),
            fieldtype: "Select",
            options: [] 
        },
        {
            fieldname: "employee_id",
            label: __("Employee ID"),
            fieldtype: "Select",
            options: [] 
        }
    ]    
};
