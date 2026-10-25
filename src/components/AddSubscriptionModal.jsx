import { useCallback, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { parseDateOnly } from "../utils.js";

const initialForm = {
  name: "",
  price: "",
  renewalDate: "",
  category: "Uncategorized",
  billingCycle: "monthly",
  status: "active",
};

function formatDateForInput(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  return match ? `${match[2]}/${match[3]}/${match[1]}` : "";
}

function parseDateInput(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;

  const date = `${match[3]}-${match[1]}-${match[2]}`;
  return parseDateOnly(date) ? date : null;
}

export default function AddSubscriptionModal({
  open,
  onClose,
  onAdd,
  subscription = null,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const closeModal = useCallback(() => {
    setForm(initialForm);
    setErrors({});
    setSubmitError("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setErrors({});
      setSubmitError("");
      return undefined;
    }

    setForm(
      subscription
        ? {
            name: subscription.name,
            price: String(subscription.price),
            renewalDate: formatDateForInput(subscription.renewalDate),
            category: subscription.category || "Uncategorized",
            billingCycle: subscription.billingCycle || "monthly",
            status: subscription.status,
          }
        : initialForm,
    );
    setErrors({});
    setSubmitError("");
  }, [open, subscription]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, closeModal]);

  if (!open) return null;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmitError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Service name is required.";
    if (!form.price.trim()) {
      nextErrors.price = "Price is required.";
    } else if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      nextErrors.price = "Price must be greater than 0.";
    }
    if (!form.renewalDate) {
      nextErrors.renewalDate = "Renewal date is required.";
    } else if (!parseDateInput(form.renewalDate)) {
      nextErrors.renewalDate = "Enter a valid date in MM/DD/YYYY format.";
    }
    if (!["active", "inactive"].includes(form.status)) {
      nextErrors.status = "Choose a valid status.";
    }
    if (!["monthly", "annual"].includes(form.billingCycle)) {
      nextErrors.billingCycle = "Choose a valid billing cycle.";
    }

    setErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length > 0) return;

    const result = onAdd({
      name: form.name.trim(),
      price: Number(form.price),
      renewalDate: parseDateInput(form.renewalDate),
      category: form.category.trim(),
      billingCycle: form.billingCycle,
      status: form.status,
    });

    if (result !== true) {
      setSubmitError(
        typeof result === "string"
          ? result
          : "The subscription could not be saved. Please try again.",
      );
      return;
    }

    setForm(initialForm);
    setErrors({});
    closeModal();
  };

  const fieldClass =
    "w-full rounded-lg border border-line/40 bg-canvas px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cta/40";

  return (
    <div
      className="modal-overlay items-end md:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-subscription-title"
        className="modal"
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted/50 md:hidden"
        />
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="add-subscription-title"
            className="font-heading text-xl font-bold text-ink"
          >
            {subscription ? "Edit Subscription" : "Add Subscription"}
          </h2>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close dialog"
            className="text-muted transition-colors hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="subscription-name"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Service name
            </label>
            <input
              id="subscription-name"
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              autoFocus
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "subscription-name-error" : undefined}
              placeholder="e.g. Netflix"
              className={fieldClass}
            />
            {errors.name && (
              <p id="subscription-name-error" className="mt-1 text-xs font-semibold text-danger">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="subscription-category"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Category
              </label>
              <input
                id="subscription-category"
                name="category"
                type="text"
                list="subscription-category-options"
                value={form.category}
                onChange={updateField}
                placeholder="e.g. Entertainment"
                className={fieldClass}
              />
              <datalist id="subscription-category-options">
                <option>Uncategorized</option>
                <option>Entertainment</option>
                <option>Design</option>
                <option>Developer</option>
                <option>Productivity</option>
                <option>Storage</option>
                <option>Other</option>
              </datalist>
            </div>
            <div>
              <label
                htmlFor="subscription-cycle"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Billing cycle
              </label>
              <select
                id="subscription-cycle"
                name="billingCycle"
                value={form.billingCycle}
                onChange={updateField}
                aria-invalid={Boolean(errors.billingCycle)}
                aria-describedby={
                  errors.billingCycle ? "subscription-cycle-error" : undefined
                }
                className={fieldClass}
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
              {errors.billingCycle && (
                <p id="subscription-cycle-error" className="mt-1 text-xs font-semibold text-danger">
                  {errors.billingCycle}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="subscription-price"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              {form.billingCycle === "annual" ? "Annual price (USD)" : "Monthly price (USD)"}
            </label>
            <input
              id="subscription-price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              value={form.price}
              onChange={updateField}
              aria-invalid={Boolean(errors.price)}
              aria-describedby={errors.price ? "subscription-price-error" : undefined}
              placeholder="0.00"
              className={`${fieldClass} font-mono tabular-nums`}
            />
            {errors.price && (
              <p id="subscription-price-error" className="mt-1 text-xs font-semibold text-danger">
                {errors.price}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="subscription-renewal-date"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Renewal date
            </label>
            <input
              id="subscription-renewal-date"
              name="renewalDate"
              type="text"
              inputMode="numeric"
              lang="en-US"
              dir="ltr"
              value={form.renewalDate}
              onChange={updateField}
              aria-invalid={Boolean(errors.renewalDate)}
              aria-describedby={
                errors.renewalDate ? "subscription-renewal-date-error" : undefined
              }
              placeholder="MM/DD/YYYY"
              className={`${fieldClass} font-mono tabular-nums`}
            />
            {errors.renewalDate && (
              <p id="subscription-renewal-date-error" className="mt-1 text-xs font-semibold text-danger">
                {errors.renewalDate}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="subscription-status"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted"
            >
              Status
            </label>
            <select
              id="subscription-status"
              name="status"
              value={form.status}
              onChange={updateField}
              aria-invalid={Boolean(errors.status)}
              aria-describedby={errors.status ? "subscription-status-error" : undefined}
              className={fieldClass}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
              <p id="subscription-status-error" className="mt-1 text-xs font-semibold text-danger">
                {errors.status}
              </p>
            )}
          </div>

          {submitError && (
            <p role="alert" className="text-sm font-semibold text-danger">
              {submitError}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" onClick={closeModal} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} aria-hidden="true" />
              {subscription ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
