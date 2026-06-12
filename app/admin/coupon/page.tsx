"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Coupon = {
    id: string;
    code: string;
    discount_percent: number;
    min_cart_value: number;
    max_discount_amount: number | null;
    valid_from: string;
    valid_until: string;
    usage_limit: number | null;
    times_used: number;
    active: boolean;
    created_at: string;
};

type CouponFormData = Omit<Coupon, "id" | "times_used" | "created_at">;

const EMPTY_FORM: CouponFormData = {
    code: "",
    discount_percent: 10,
    min_cart_value: 0,
    max_discount_amount: null,
    valid_from: "",
    valid_until: "",
    usage_limit: null,
    active: true,
};

function StatusBadge({ coupon }: { coupon: Coupon }) {
    const now = new Date();
    const from = new Date(coupon.valid_from);
    const until = new Date(coupon.valid_until);

    if (!coupon.active)
        return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Inactive</span>;
    if (now < from)
        return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Scheduled</span>;
    if (now > until)
        return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">Expired</span>;
    return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Live</span>;
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

function fmtINR(val: number | null) {
    if (val === null) return "—";
    return "₹" + val.toLocaleString("en-IN");
}

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-900";
const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

export default function AdminCouponsPage() {
    const supabase = createClient();

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Coupon | null>(null);
    const [form, setForm] = useState<CouponFormData>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
    const [deleting, setDeleting] = useState(false);

    async function fetchCoupons() {
        setLoading(true);
        const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) setError(error.message);
        else setCoupons(data as Coupon[]);
        setLoading(false);
    }

    useEffect(() => { fetchCoupons(); }, []);

    function openCreate() {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setFormError(null);
        setModalOpen(true);
    }

    function openEdit(coupon: Coupon) {
        setEditTarget(coupon);
        setForm({
            code: coupon.code,
            discount_percent: coupon.discount_percent,
            min_cart_value: coupon.min_cart_value,
            max_discount_amount: coupon.max_discount_amount,
            valid_from: coupon.valid_from.slice(0, 16),
            valid_until: coupon.valid_until.slice(0, 16),
            usage_limit: coupon.usage_limit,
            active: coupon.active,
        });
        setFormError(null);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditTarget(null);
        setFormError(null);
    }

    async function handleSave() {
        setFormError(null);
        if (!form.code.trim()) return setFormError("Coupon code is required.");
        if (!form.valid_from || !form.valid_until) return setFormError("Both date fields are required.");
        if (new Date(form.valid_from) >= new Date(form.valid_until)) return setFormError("Valid From must be before Valid Until.");
        if (form.discount_percent < 1 || form.discount_percent > 20) return setFormError("Discount must be between 1% and 20%.");

        setSaving(true);
        const payload = {
            ...form,
            code: form.code.toUpperCase().trim(),
            valid_from: new Date(form.valid_from).toISOString(),
            valid_until: new Date(form.valid_until).toISOString(),
        };

        const { error: dbError } = editTarget
            ? await supabase.from("coupons").update(payload).eq("id", editTarget.id)
            : await supabase.from("coupons").insert(payload);

        setSaving(false);
        if (dbError) setFormError(dbError.message);
        else { closeModal(); fetchCoupons(); }
    }

    async function toggleActive(coupon: Coupon) {
        await supabase.from("coupons").update({ active: !coupon.active }).eq("id", coupon.id);
        fetchCoupons();
    }

    async function confirmDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        await supabase.from("coupons").delete().eq("id", deleteTarget.id);
        setDeleting(false);
        setDeleteTarget(null);
        fetchCoupons();
    }

    function setField(key: keyof CouponFormData, value: string, type: string) {
        const parsed = type === "number" ? (value === "" ? null : Number(value)) : value;
        setForm((p) => ({ ...p, [key]: parsed }));
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold text-gray-900">Coupons</h1>
                <button onClick={openCreate} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                    + New Coupon
                </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

            {/* Table */}
            {loading ? (
                <p className="text-center text-gray-400 py-16">Loading coupons…</p>
            ) : coupons.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <p className="mb-4 text-sm">No coupons yet. Create one to get started.</p>
                    <button onClick={openCreate} className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                        + New Coupon
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {["Code", "Discount", "Min Cart", "Max Cap", "Validity", "Usage", "Status", "Active", "Actions"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((c) => (
                                <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono font-bold text-gray-900 tracking-wider">{c.code}</td>
                                    <td className="px-4 py-3 text-gray-700">{c.discount_percent}%</td>
                                    <td className="px-4 py-3 text-gray-700">{fmtINR(c.min_cart_value)}</td>
                                    <td className="px-4 py-3 text-gray-700">{fmtINR(c.max_discount_amount)}</td>
                                    <td className="px-4 py-3 text-gray-700">
                                        <div>{fmtDate(c.valid_from)}</div>
                                        <div className="text-xs text-gray-400">→ {fmtDate(c.valid_until)}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">
                                        {c.times_used}
                                        {c.usage_limit !== null && <span className="text-gray-400 text-xs">/{c.usage_limit}</span>}
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge coupon={c} /></td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggleActive(c)}
                                            className={`relative w-9 h-5 rounded-full transition-colors ${c.active ? "bg-gray-900" : "bg-gray-300"}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${c.active ? "translate-x-4" : "translate-x-0"}`} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(c)} className="px-3 py-1 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">Edit</button>
                                            <button onClick={() => setDeleteTarget(c)} className="px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900">{editTarget ? "Edit Coupon" : "New Coupon"}</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Code — full width */}
                            <div className="col-span-2">
                                <label className={labelCls}>Coupon Code</label>
                                <input
                                    type="text"
                                    className={inputCls}
                                    placeholder="e.g. DIWALI10"
                                    value={form.code}
                                    onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                                />
                                <p className="text-xs text-gray-400 mt-1">Auto-uppercased. Share this with customers.</p>
                            </div>

                            <div>
                                <label className={labelCls}>Discount (%)</label>
                                <input type="number" min={1} max={20} className={inputCls} placeholder="10"
                                    value={form.discount_percent ?? ""}
                                    onChange={(e) => setField("discount_percent", e.target.value, "number")} />
                            </div>

                            <div>
                                <label className={labelCls}>Min Cart Value (₹)</label>
                                <input type="number" min={0} className={inputCls} placeholder="0"
                                    value={form.min_cart_value ?? ""}
                                    onChange={(e) => setField("min_cart_value", e.target.value, "number")} />
                            </div>

                            <div>
                                <label className={labelCls}>Max Discount Cap (₹)</label>
                                <input type="number" min={0} className={inputCls} placeholder="No cap"
                                    value={form.max_discount_amount ?? ""}
                                    onChange={(e) => setField("max_discount_amount", e.target.value, "number")} />
                            </div>

                            <div>
                                <label className={labelCls}>Usage Limit</label>
                                <input type="number" min={1} className={inputCls} placeholder="Unlimited"
                                    value={form.usage_limit ?? ""}
                                    onChange={(e) => setField("usage_limit", e.target.value, "number")} />
                            </div>

                            <div>
                                <label className={labelCls}>Valid From</label>
                                <input type="datetime-local" className={inputCls}
                                    value={form.valid_from}
                                    onChange={(e) => setForm((p) => ({ ...p, valid_from: e.target.value }))} />
                            </div>

                            <div>
                                <label className={labelCls}>Valid Until</label>
                                <input type="datetime-local" className={inputCls}
                                    value={form.valid_until}
                                    onChange={(e) => setForm((p) => ({ ...p, valid_until: e.target.value }))} />
                            </div>

                            <div className="col-span-2 flex items-center gap-2 mt-1">
                                <input id="active" type="checkbox" className="w-4 h-4 cursor-pointer"
                                    checked={form.active}
                                    onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
                                <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">Active (coupon can be used)</label>
                            </div>
                        </div>

                        {formError && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{formError}</div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={closeModal} className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
                                {saving ? "Saving…" : editTarget ? "Save Changes" : "Create Coupon"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-bold text-gray-900">Delete Coupon?</h2>
                            <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            This will permanently delete <strong>{deleteTarget.code}</strong>. Orders that already used this coupon are unaffected.
                        </p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={confirmDelete} disabled={deleting} className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
                                {deleting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}