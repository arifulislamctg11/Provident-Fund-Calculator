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


frappe.ui.form.on('Employee Details', {       // ← your parent doctype
    onload: function(frm) {
        // initial compute
        compute_total_deposit(frm);
    }
});

frappe.ui.form.on('Monthly PF', { // ← the DocType of your child rows
    deposit_amount: function(frm, cdt, cdn) {
        // when an individual deposit changes
        compute_total_deposit(frm);
    },
    items_add: function(frm) {
        compute_total_deposit(frm);
    },
    items_remove: function(frm) {
        compute_total_deposit(frm);
    }
});

// helper
function compute_total_deposit(frm) {
    let total = 0.0;
    // iterate rows in the child table field (change 'items' to your fieldname)
    (frm.doc.monthly_pf_percent || []).forEach(row => {
        // change 'deposit_amount' to your fieldname in the child table
        total += flt(row.net_amount, 2);
    });
    // write back to the parent
    frm.set_value('total_balance', total);
    // optionally trigger refresh
    frm.refresh_field('total_balance');
}
