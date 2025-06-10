frappe.pages['provident_fund_summary'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Provident Fund Summary',
        single_column: true
    });

    page.add_button('Print PDF', () => {
        window.print();
    });

    $(wrapper).find('.layout-main-section').html(`
    <div style="padding: 20px;">
        <div style="text-align: center; font-size: 20px; font-weight: bold;">
            Provident Fund Summary
        </div><br>

        <div>
            <strong>Employee Name:</strong> <span id="emp_name"></span><br>
            <strong>Employee ID:</strong> <span id="emp_id"></span><br>
            <strong>Designation:</strong> <span id="designation"></span><br>
        </div>

        <table class="table table-bordered" style="margin-top: 20px;" id="report-table">
            <thead>
                <tr><th>Month</th><th>PF Amount</th><th>Employer Contribution</th></tr>
            </thead>
            <tbody></tbody>
        </table>

        <div style="margin-top: 50px;">
            <div style="width: 45%; float: left; text-align: center;">
                _______________________<br><strong>Employee Signature</strong>
            </div>
            <div style="width: 45%; float: right; text-align: center;">
                _______________________<br><strong>Authorized Signatory</strong>
            </div>
            <div style="clear: both;"></div>
        </div>
    </div>
`);

    frappe.call({
        method: "provident_fund_calculator.api.provident_fund_summary.get_pf_report_data",
        args: { employee_id: frappe.session.user },
        callback: function(r) {
            if (r.message) {
                $('#emp_name').text(r.message.employee_name);
                $('#emp_id').text(r.message.employee_id);
                $('#designation').text(r.message.designation);

                let html = "";
                r.message.data.forEach(row => {
                    html += `<tr><td>${row.month}</td><td>${row.pf_amount}</td><td>${row.employer_contribution}</td></tr>`;
                });
                $('#report-table tbody').html(html);
            }
        }
    });
};
