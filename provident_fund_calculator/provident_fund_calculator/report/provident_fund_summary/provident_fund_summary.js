frappe.query_reports["Provident Fund Summary"] = {
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
// frappe.query_reports["Provident Fund Summary"] = {
//     add_total_row: 0,

//     onload: function(report) {
//         // Get employee data and populate filters
//         frappe.db.get_list('Employee Details', {
//             fields: ['first_name', 'employee_id', 'designation'],
//             limit: 1000
//         }).then(data => {
//             if (!data || !Array.isArray(data)) {
//                 console.error("Invalid data received:", data);
//                 return;
//             }

//             try {
//                 // Process names
//                 const names = [...new Set(data.map(d => d.first_name).filter(name => name))];
//                 this.setup_filter(report, 'employee', names);

//                 // Process employee IDs
//                 const ids = [...new Set(data.map(d => d.employee_id).filter(id => id))];
//                 this.setup_filter(report, 'employee_id', ids);

//                 // Process designations
//                 const designations = [...new Set(data.map(d => d.designation).filter(desig => desig))];
//                 this.setup_filter(report, 'designation', designations);
//             } catch (e) {
//                 console.error("Error setting up filters:", e);
//             }
//         }).catch(error => {
//             console.error("Error fetching employee data:", error);
//         });
//     },

//     setup_filter: function(report, fieldname, options) {
//         const filter = report.get_filter(fieldname);
//         if (filter) {
//             filter.df.options = ["", ...options];
//             filter.refresh();
//         } else {
//             console.warn(`Filter ${fieldname} not found`);
//         }
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