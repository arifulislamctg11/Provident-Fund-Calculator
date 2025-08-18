const MONTH_ORDER = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};
const toFloat = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));

frappe.ui.form.on("Employee Details", {
  refresh(frm) {
    recompute_all(frm);
  },
  validate(frm) {
    recompute_all(frm);
  },
  date_of_confirmation(frm) {
    recompute_all(frm);
  },
});

frappe.ui.form.on("Monthly PF", {
  // If you enter basic salary, auto-fill 5%
  basic_salary(frm, cdt, cdn) {
    const row = locals[cdt][cdn];
    const basic = toFloat(row.basic_salary);
    frappe.model.set_value(cdt, cdn, "employee_share_basic5", basic * 0.05);
    recompute_all(frm);
  },

  employee_share_basic5(frm) {
    recompute_all(frm);
  },

  year(frm) {
    recompute_all(frm);
  },
});

// -------------------- Core logic --------------------
function recompute_all(frm) {
  update_current_year_assoc(frm); // first, update association share everywhere
  compute_row_totals(frm); // then recompute totals using updated assoc
  compute_yearly_totals(frm); // yearly summary last
  frm.refresh_field("monthly_pf_percent");
}

// Per-row totals: total_deposit = employee_share_basic5 + association_contribution(whatever your field is)
function compute_row_totals(frm) {
  const rows = frm.doc.monthly_pf_percent || [];
  rows.forEach((row) => {
    // Support either fieldname the site may be using
    const assoc = row.hasOwnProperty("association_contribution100")
      ? toFloat(row.association_contribution100)
      : toFloat(row.association_contribution);

    const emp5 = toFloat(row.employee_share_basic5);
    const total = emp5 + assoc;

    row.total_deposit = total;
    row.net_amount = total;
  });
}

// Yearly total: sum of employee_share_basic5 Jan→Dec and put into December row (or last row of year)
function compute_yearly_totals(frm) {
  const rows = frm.doc.monthly_pf_percent || [];
  if (!rows.length) return;

  // group rows by year
  const byYear = {};
  rows.forEach((r) => {
    const y = r.year; // No need to parse, already a number
    if (!y) return;
    byYear[y] ||= { sum: 0, rows: [] };
    byYear[y].sum += toFloat(r.employee_share_basic5);
    byYear[y].rows.push(r);
  });

  // reset all yearly_total first
  rows.forEach((r) => (r.yearly_total = 0));

  // write total to December row (or last-in-year by month order)
  Object.keys(byYear).forEach((y) => {
    const group = byYear[y];
    // find December (case-insensitive)
    let target = group.rows.find(
      (r) => String(r.month || "").toLowerCase() === "december"
    );

    if (!target) {
      // pick the row with the greatest month order as a fallback
      target = group.rows
        .slice()
        .sort(
          (a, b) =>
            (MONTH_ORDER[String(a.month || "").toLowerCase()] || 0) -
            (MONTH_ORDER[String(b.month || "").toLowerCase()] || 0)
        )
        .pop();
    }

    if (target) target.yearly_total = Number(group.sum.toFixed(2));
  });
}

// assco current

function update_current_year_assoc(frm) {
  const rows = frm.doc.monthly_pf_percent || [];
  if (!rows.length) return;

  // --- Step 1: find latest ratio from filled rows ---
  let latestRatio = null;
  const sorted = rows.slice().sort((a, b) => {
    const ya = toFloat(a.year),
      yb = toFloat(b.year);
    if (ya !== yb) return ya - yb;
    const ma = MONTH_ORDER[String(a.month || "").toLowerCase()] || 0;
    const mb = MONTH_ORDER[String(b.month || "").toLowerCase()] || 0;
    return ma - mb;
  });

  for (let i = sorted.length - 1; i >= 0; i--) {
    const r = sorted[i];
    const emp5 = toFloat(r.employee_share_basic5);
    const assoc = toFloat(r.association_contribution100);
    if (emp5 > 0 && assoc > 0) {
      latestRatio = assoc / emp5;
      break;
    }
  }

  if (latestRatio == null) return;

  // --- Step 2: apply ratio to ALL rows (direct assignment) ---
  rows.forEach((r) => {
    const emp5 = toFloat(r.employee_share_basic5);
    r.association_contribution100 = Number((emp5 * latestRatio).toFixed(2));
    r.total_deposit = emp5 + r.association_contribution100;
    r.net_amount = r.total_deposit;
  });

  frm.refresh_field("monthly_pf_percent");
}
