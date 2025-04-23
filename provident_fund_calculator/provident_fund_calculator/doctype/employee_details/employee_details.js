// Total deposi and net amount
frappe.ui.form.on('Monthly PF', {
	employee_share_basic5: function(frm, cdt, cdn) {
		calculate_amount(cdt, cdn);
	},

	association_contribution100: function(frm, cdt, cdn) {
		calculate_amount(cdt, cdn);
	}
});

function calculate_amount(cdt, cdn) {
	let row = locals[cdt][cdn];

	let emp_share = parseFloat(row.employee_share_basic5) || 0;
	let assoc_contribution = parseFloat(row.association_contribution100) || 0;

	let total = emp_share + assoc_contribution;

	console.log("💡 Total Deposit:", total);

	frappe.model.set_value(cdt, cdn, 'total_deposit', total);
	frappe.model.set_value(cdt, cdn, 'net_amount', total);
}

// Basic salary
frappe.ui.form.on('Monthly PF', {
	net_amount: function(frm, cdt, cdn) {
		let row = locals[cdt][cdn];
		let net_amount = parseFloat(row.net_amount) || 0;
		let basic_salary = net_amount * 10;
		frappe.model.set_value(cdt, cdn, 'basic_salary', basic_salary);
	}
});