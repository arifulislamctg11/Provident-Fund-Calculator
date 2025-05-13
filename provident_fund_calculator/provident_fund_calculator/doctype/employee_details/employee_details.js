// Total deposit and net amount
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

	console.log(" Total Deposit:", total);

	frappe.model.set_value(cdt, cdn, 'total_deposit', total);
	frappe.model.set_value(cdt, cdn, 'net_amount', total);
}

// employee share basic 5%
frappe.ui.form.on('Monthly PF', {
  basic_salary: function(frm, cdt, cdn) {
      let row = locals[cdt][cdn];
      if (row.basic_salary) {
          frappe.model.set_value(cdt, cdn, 'employee_share_basic5', row.basic_salary * 0.05);
      }
  }
});

// association share
frappe.ui.form.on('Employee Details', {
  validate: function(frm) {
      calculate_all_contributions(frm);
  }
});

frappe.ui.form.on('Monthly PF', {
  basic_salary: function(frm, cdt, cdn) {
      calculate_contribution(frm, cdt, cdn);
  },
  year: function(frm, cdt, cdn) {
      calculate_contribution(frm, cdt, cdn);
  }
});

function calculate_all_contributions(frm) {
  (frm.doc.monthly_pf_percent || []).forEach(row => {
      calculate_contribution(frm, row.doctype, row.name);
  });
}
function calculate_contribution(frm, cdt, cdn) {
  const row = locals[cdt][cdn];

  if (!frm.doc.date_of_confirmation || !row.year || !row.basic_salary) return;

  const confirmation_year = frappe.datetime.str_to_obj(frm.doc.date_of_confirmation).getFullYear();
  const row_year = parseInt(row.year, 10);
  const years_of_service = Math.max(0, row_year - confirmation_year);
  const five_pct_basic = row.basic_salary * 0.05;

  let contribution = 0;
  if (years_of_service < 5) {
      contribution = 0.0;  
  } else if (years_of_service < 7) {
      contribution = five_pct_basic * 0.5;
  } else if (years_of_service < 9) {
      contribution = five_pct_basic * 0.75;
  } else {
      contribution = five_pct_basic;
  }

  frappe.model.set_value(cdt, cdn, 'association_contribution100', contribution).then(() => {
      frm.fields_dict.monthly_pf_percent.grid.refresh();
  });
}

// duplicate entry for month & year
  frappe.ui.form.on('Employee Details', {
    validate: function(frm) {
        const seen = new Set();
        for (let row of frm.doc.monthly_pf_percent || []) {
            const key = `${row.month}-${row.year}`;
            if (seen.has(key)) {
                frappe.throw(`Duplicate entry found for ${row.month} ${row.year}`);
            }
            seen.add(key);
        }
    }
});









  
    