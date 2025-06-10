// frappe.query_reports["Employee PF Report without AC"] = {
//     add_total_row: 0,

//     onload: function (report) {
//         frappe.db.get_list('Employee Details', {
//             fields: ['first_name', 'employee_id', 'designation'],
//             limit: 1000
//         }).then(data => {
//             // Populate Employee Names
//             const names = [...new Set(data.map(d => d.first_name).filter(Boolean))];
//             const employeeFilter = report.get_filter('employee');
//             if (employeeFilter) {
//                 employeeFilter.df.options = ["", ...names];
//                 employeeFilter.refresh();
//             }

//             // Populate Employee IDs
//             const ids = [...new Set(data.map(d => d.employee_id).filter(Boolean))];
//             const employeeIDFilter = report.get_filter('employee_id');
//             if (employeeIDFilter) {
//                 employeeIDFilter.df.options = ["", ...ids];
//                 employeeIDFilter.refresh();
//             }

//             // Populate Designations
//             const designations = [...new Set(data.map(d => d.designation).filter(Boolean))];
//             const designationFilter = report.get_filter('designation');
//             if (designationFilter) {
//                 designationFilter.df.options = ["", ...designations];
//                 designationFilter.refresh();
//             }
//         });
//         report.page.set_summary([
//             {
//                 label: __("Signature"),
//                 value: "_______________________",
//                 indicator: "blue"
//             }
//         ]);
//     },

//     filters: [
//         {
//             fieldname: "employee",
//             label: __("Employee Name"),
//             fieldtype: "Select",
//             options: []
//         },
//         {
//             fieldname: "employee_id",
//             label: __("Employee ID"),
//             fieldtype: "Select",
//             options: []
//         },
//         {
//             fieldname: "designation",
//             label: __("Designation"),
//             fieldtype: "Select",
//             options: []
//         }
//     ]
// };
frappe.query_reports["Employee PF Report without AC"] = {
    add_total_row: 0,

    onload: function (report) {
        frappe.db.get_list('Employee Details', {
            fields: ['first_name', 'employee_id', 'designation'],
            limit: 1000
        }).then(data => {
            const names = [...new Set(data.map(d => d.first_name).filter(Boolean))];
            const employeeFilter = report.get_filter('employee');
            if (employeeFilter) {
                employeeFilter.df.options = ["", ...names];
                employeeFilter.refresh();
            }

            const ids = [...new Set(data.map(d => d.employee_id).filter(Boolean))];
            const employeeIDFilter = report.get_filter('employee_id');
            if (employeeIDFilter) {
                employeeIDFilter.df.options = ["", ...ids];
                employeeIDFilter.refresh();
            }

            const designations = [...new Set(data.map(d => d.designation).filter(Boolean))];
            const designationFilter = report.get_filter('designation');
            if (designationFilter) {
                designationFilter.df.options = ["", ...designations];
                designationFilter.refresh();
            }
        });

        // Add signature at the bottom
        report.page.set_summary([
            {
                label: __("Signature"),
                value: "_______________________",
                indicator: "blue"
            }
        ]);
    },

    filters: [
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
        },
        {
            fieldname: "designation",
            label: __("Designation"),
            fieldtype: "Select",
            options: []
        }
    ]
};
